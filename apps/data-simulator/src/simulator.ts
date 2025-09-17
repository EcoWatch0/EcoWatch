import { SensorReading, EnvironmentalData, DatabaseSensor } from './types';
import { DatabaseService } from './database.service';
import { dataFakerConfig } from '@ecowatch/shared';

// --- RNG (seedable) ---
class SeededRng {
  private state: number;
  constructor(seed: number) {
    // Mulberry32
    this.state = seed >>> 0;
  }
  next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  normal(mean = 0, stdDev = 1): number {
    // Box-Muller
    const u1 = 1 - this.next();
    const u2 = 1 - this.next();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * stdDev;
  }
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

// --- Types internes de simulation ---
type WeatherScenarioType = 'none' | 'rain' | 'heatwave' | 'cold_dry';

interface WeatherScenario {
  type: WeatherScenarioType;
  startMs: number;
  endMs: number;
}

interface SensorSimState {
  batteryLevel: number;
  batteryDecayMultiplier: number; // variabilité par capteur
  lastTickMs: number | null;
  driftCelsius: number; // dérive pour température
  driftStartMs: number;
  nextMaintenanceCheckMs: number;
  soilMoisturePct: number;
  waterQualityIdx: number; // WQI 0-100
  plateauUntilMs: number | null; // plateau anomalies
  rng: SeededRng;
  location: { lat: number; lng: number; name: string };
  accuracy: number; // metadata.accuracy base
}

// --- Constantes / env params ---
function parseEnvNumber(name: string, def: number): number {
  const raw = process.env[name];
  if (!raw) return def;
  const n = Number(raw);
  return Number.isFinite(n) ? n : def;
}

function parseEnvBool(name: string, def: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return def;
  const val = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(val)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(val)) return false;
  return def;
}

function parseBBoxEnv(): { latMin: number; lngMin: number; latMax: number; lngMax: number } {
  const raw = process.env.DATA_FAKER_CITY_BBOX;
  if (!raw) return { latMin: 48.80, lngMin: 2.28, latMax: 48.90, lngMax: 2.41 };
  const parts = raw.split(',').map((p: string) => Number(p.trim()));
  if (parts.length !== 4 || parts.some((p: number) => !Number.isFinite(p))) {
    return { latMin: 48.80, lngMin: 2.28, latMax: 48.90, lngMax: 2.41 };
  }
  const [latMin, lngMin, latMax, lngMax] = parts;
  return { latMin, lngMin, latMax, lngMax };
}

function hashStringToInt(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function getParisLocalHour(date: Date): number {
  // Approx: Europe/Paris is UTC+1 in winter, UTC+2 in summer (rough)
  const month = date.getUTCMonth() + 1;
  const isSummer = month >= 4 && month <= 10;
  const offset = isSummer ? 2 : 1;
  const hour = (date.getUTCHours() + offset + 24) % 24;
  return hour + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
}

function arrondissementName(rng: SeededRng): string {
  const arrs = ['1er', '2e', '3e', '4e', '5e', '6e', '7e', '8e', '9e', '10e', '11e', '12e', '13e', '14e', '15e', '16e', '17e', '18e', '19e', '20e'];
  return `${arrs[rng.int(0, arrs.length - 1)]}`;
}

export class DataSimulator {
  private sensors: DatabaseSensor[] = [];
  private sensorState: Map<string, SensorSimState> = new Map();
  private globalRng: SeededRng;
  private weather: WeatherScenario | null = null;

  constructor(
    private databaseService: DatabaseService,
  ) {
    const seed = parseEnvNumber('DATA_FAKER_SEED', 1337);
    this.globalRng = new SeededRng(seed);
  }

  /**
   * Initialise les capteurs depuis la base de données
   */
  async initialize() {
    console.log('Initializing simulator with database sensors...');

    await this.databaseService.createTestSensors();
    this.sensors = await this.databaseService.getActiveSensors();

    console.log(`Found ${this.sensors.length} active sensors`);
    this.sensors.forEach(sensor => {
      console.log(`  - ${sensor.name} (${sensor.type}) - Org: ${sensor.organization.name}`);
      this.ensureSensorState(sensor);
    });
  }

  // Ensure per-sensor state
  private ensureSensorState(sensor: DatabaseSensor): SensorSimState {
    let state = this.sensorState.get(sensor.id);
    if (state) return state;

    const baseSeed = hashStringToInt(String(parseEnvNumber('DATA_FAKER_SEED', 1337)) + ':' + sensor.id);
    const rng = new SeededRng(baseSeed);
    const bbox = parseBBoxEnv();
    const lat = sensor.latitude ?? rng.range(bbox.latMin, bbox.latMax);
    const lng = sensor.longitude ?? rng.range(bbox.lngMin, bbox.lngMax);
    const name = `EcoWatch Zone ${arrondissementName(rng)}`;

    state = {
      batteryLevel: clamp(85 + rng.normal(10, 5), 50, 100),
      batteryDecayMultiplier: clamp(0.8 + rng.normal(0.2, 0.1), 0.5, 1.5),
      lastTickMs: null,
      driftCelsius: rng.normal(0, 0.05),
      driftStartMs: Date.now(),
      nextMaintenanceCheckMs: Date.now() + 6 * 60 * 60 * 1000,
      soilMoisturePct: clamp(20 + rng.normal(0, 5), 5, 60),
      waterQualityIdx: clamp(80 + rng.normal(0, 5), 60, 95),
      plateauUntilMs: null,
      rng,
      location: { lat, lng, name },
      accuracy: clamp(Math.round(93 + rng.normal(0, 2)), 90, 99),
    };
    this.sensorState.set(sensor.id, state);
    return state;
  }

  // --- Weather scenario orchestrator ---
  private maybeRotateScenario(nowMs: number, intervalMs: number) {
    // Probability scaled per tick
    const pPerDayStart = 0.12; // ~ 12%/day chance to start a scenario
    const pStart = pPerDayStart * (intervalMs / 86400000);
    const pEnd = 0.06 * (intervalMs / 86400000); // low chance to end early

    if (!this.weather || nowMs > this.weather.endMs) {
      if (this.globalRng.chance(pStart)) {
        const pick = this.globalRng.int(0, 2);
        let type: WeatherScenarioType = 'rain';
        if (pick === 1) type = 'heatwave';
        if (pick === 2) type = 'cold_dry';

        let durationMs = 0;
        if (type === 'rain') durationMs = this.globalRng.int(30, 120) * 60 * 1000;
        if (type === 'heatwave') durationMs = this.globalRng.int(24, 120) * 60 * 60 * 1000;
        if (type === 'cold_dry') durationMs = this.globalRng.int(12, 72) * 60 * 60 * 1000;
        this.weather = { type, startMs: nowMs, endMs: nowMs + durationMs };
        console.log(`Weather scenario started: ${type}, duration ${(durationMs / 3600000).toFixed(2)}h`);
      } else {
        this.weather = null;
      }
    } else {
      if (this.globalRng.chance(pEnd)) {
        console.log(`Weather scenario ended early: ${this.weather.type}`);
        this.weather = null;
      }
    }
  }

  private scenarioInfluence(nowMs: number): { dT: number; dHumidity: number; dAir: number; dSoilFactor: number; dWater: number } {
    if (!this.weather) return { dT: 0, dHumidity: 0, dAir: 0, dSoilFactor: 1, dWater: 0 };
    const { type, startMs, endMs } = this.weather;
    const progress = smoothstep(0, 1, clamp((nowMs - startMs) / (endMs - startMs), 0, 1));
    const easing = Math.sin(progress * Math.PI); // smooth in/out
    if (type === 'rain') {
      const dT = -1.0 * easing;
      const dHumidity = (this.globalRng.range(10, 25)) * easing;
      const dAir = (-this.globalRng.range(5, 15)) * easing;
      const dSoilFactor = 1 + this.globalRng.range(0.05, 0.20) * easing; // applied to increment
      const dWater = -this.globalRng.range(2, 6) * easing;
      return { dT, dHumidity, dAir, dSoilFactor, dWater };
    }
    if (type === 'heatwave') {
      const dT = this.globalRng.range(3, 7) * easing;
      const dHumidity = -this.globalRng.range(5, 15) * easing;
      const dAir = this.globalRng.range(5, 20) * easing;
      const dSoilFactor = 1 - this.globalRng.range(0.02, 0.08) * easing; // faster decay
      const dWater = -this.globalRng.range(0, 2) * easing;
      return { dT, dHumidity, dAir, dSoilFactor, dWater };
    }
    // cold_dry
    const dT = -this.globalRng.range(3, 10) * easing;
    const dHumidity = -this.globalRng.range(5, 15) * easing;
    const dAir = this.globalRng.range(0, 10) * easing;
    const dSoilFactor = 1 - this.globalRng.range(0, 0.02) * easing;
    const dWater = 0;
    return { dT, dHumidity, dAir, dSoilFactor, dWater };
  }

  // --- Générateurs ---
  private generateTemperature(state: SensorSimState, now: Date, influences: { dT: number }): number {
    const month = now.getUTCMonth() + 1;
    const isSummer = month >= 6 && month <= 8;
    const isWinter = month === 12 || month <= 2;
    const base = isSummer ? 22 : isWinter ? 5 : 12;
    const amp = isSummer ? this.globalRng.range(5, 8) : this.globalRng.range(3, 6);
    const localHour = getParisLocalHour(now);
    const phase = ((localHour - 5) / 24) * 2 * Math.PI; // min vers 5h, max ~ 15-16h
    let temp = base + amp * Math.sin(phase) + influences.dT + state.driftCelsius;
    temp += state.rng.normal(0, 0.3);
    temp = clamp(temp, -10, 40);
    return Math.round(temp * 10) / 10;
  }

  private generateHumidity(tempC: number, influences: { dHumidity: number }): number {
    // Inversement corrélé à la température
    const target = clamp(80 - 0.8 * (tempC - 15), 30, 95);
    let humidity = target + influences.dHumidity + this.globalRng.normal(0, 2.5);
    humidity = clamp(humidity, 30, 95);
    return Math.round(humidity * 10) / 10;
  }

  private generateAirQuality(tempC: number, humidityPct: number, now: Date, influences: { dAir: number }): number {
    const localHour = getParisLocalHour(now);
    let base = 30;
    const rush1 = localHour >= 7 && localHour <= 10 ? 15 : 0;
    const rush2 = localHour >= 17 && localHour <= 20 ? 15 : 0;
    base += rush1 + rush2;
    // Dégradation par temps chaud et sec
    if (tempC > 25) base += (tempC - 25) * 0.8;
    if (humidityPct < 40) base += (40 - humidityPct) * 0.5;
    let aq = base + influences.dAir + this.globalRng.normal(0, 4);
    aq = clamp(aq, 0, 100);
    return Math.round(aq);
  }

  private generateSoilMoisture(state: SensorSimState, influences: { dSoilFactor: number }, intervalMs: number, tempC: number): number {
    // Décroît lentement, plus vite s'il fait chaud; augmente par pluie
    let soil = state.soilMoisturePct;
    const hours = intervalMs / 3600000;
    const evapBase = 0.08 + Math.max(0, tempC - 20) * 0.02; // % par heure
    soil -= evapBase * hours * (2 - influences.dSoilFactor);
    // Pluie: applique un palier d'augmentation proportionnel à dSoilFactor (>1)
    if (influences.dSoilFactor > 1.01) {
      soil += (influences.dSoilFactor - 1) * this.globalRng.range(5, 20);
    }
    soil += this.globalRng.normal(0, 0.7);
    soil = clamp(soil, 5, 60);
    state.soilMoisturePct = soil;
    return Math.round(soil * 10) / 10;
  }

  private generateWaterQuality(state: SensorSimState, influences: { dWater: number }): number {
    // Tendances lentes, sensible à la pluie (baisse), retour graduel
    let wqi = state.waterQualityIdx;
    const drift = this.globalRng.normal(0, 0.15);
    wqi += drift + influences.dWater;
    // Retour vers 82 progressivement
    wqi += (82 - wqi) * 0.01;
    wqi = clamp(wqi, 60, 95);
    state.waterQualityIdx = wqi;
    return Math.round(wqi);
  }

  // --- Anomalies & pannes ---
  private maybeApplyOutlier(type: string, value: number, rng: SeededRng): number | 'drop' {
    const anomalyRate = parseEnvNumber('DATA_FAKER_ANOMALY_RATE', 0.003);
    if (!rng.chance(anomalyRate)) return value;
    const mode = rng.int(0, 2); // 0 spike, 1 zero dip, 2 plateau (handled elsewhere)
    if (mode === 0) {
      // spike plausible
      if (type === 'temperature') return clamp(value + rng.range(-8, 8), -10, 40);
      if (type === 'humidity') return clamp(value + rng.range(-40, 40), 30, 95);
      if (type === 'airQuality') return clamp(value + rng.range(-40, 60), 0, 100);
      if (type === 'waterQuality') return clamp(value + rng.range(-20, 10), 0, 100);
      if (type === 'soilMoisture') return clamp(value + rng.range(-25, 25), 5, 60);
    } else if (mode === 1) {
      // micro-chute à zéro ou drop de la mesure
      if (rng.chance(0.5)) return 0;
      return 'drop'; // panne de ce type uniquement
    } else {
      // plateau: gérer via plateauUntilMs (faible variance). Rien à faire ici.
      return value;
    }
    return value;
  }

  private applyPlateauIfNeeded(state: SensorSimState, nowMs: number, value: number): number {
    if (state.plateauUntilMs && nowMs < state.plateauUntilMs) {
      return Math.round((value + state.rng.normal(0, 0.05)) * 10) / 10;
    }
    // Chance de démarrer un plateau rare
    const anomalyRate = parseEnvNumber('DATA_FAKER_ANOMALY_RATE', 0.003);
    if (state.rng.chance(anomalyRate * 0.5)) {
      const dur = state.rng.int(2, 10) * dataFakerConfig().intervalMs;
      state.plateauUntilMs = nowMs + dur;
    }
    return value;
  }

  private maybeMaintenance(state: SensorSimState, nowMs: number, intervalMs: number) {
    if (nowMs < state.nextMaintenanceCheckMs) return;
    state.nextMaintenanceCheckMs = nowMs + 6 * 60 * 60 * 1000;
    const perDay = 0.001; // 0.1%/jour
    const p = perDay * (intervalMs / 86400000) * 6 * 24; // approx for each check window
    if (state.rng.chance(p)) {
      state.driftCelsius = state.rng.normal(0, 0.02);
      state.driftStartMs = nowMs;
      console.log('Maintenance event: temperature drift reset');
    }
  }

  private updateBattery(state: SensorSimState, intervalMs: number, publishSucceeded: boolean) {
    const decayPerHour = parseEnvNumber('DATA_FAKER_BATTERY_DECAY_PER_HOUR', 0.2);
    const hours = intervalMs / 3600000;
    let decay = decayPerHour * hours * state.batteryDecayMultiplier;
    if (!publishSucceeded) decay *= 1.6; // échecs coûtent plus
    state.batteryLevel = clamp(state.batteryLevel - decay, 0, 100);

    // Recharge rare: ~0.2%/jour
    const pRecharge = 0.002 * (intervalMs / 86400000);
    if (state.rng.chance(pRecharge) && state.batteryLevel < 80) {
      state.batteryLevel = 100;
      console.log('Battery recharge event: level restored to 100%');
    }
  }

  // --- Public API ---
  public generateSensorData(sensor: DatabaseSensor): EnvironmentalData | null {
    const intervalMs = dataFakerConfig().intervalMs;
    const dropRate = parseEnvNumber('DATA_FAKER_DROP_RATE', 0.005);
    const multiMetric = parseEnvBool('DATA_FAKER_MULTI_METRIC', true);
    const now = new Date();
    const nowMs = now.getTime();
    const state = this.ensureSensorState(sensor);

    // Communication drop (entire message)
    if (state.rng.chance(dropRate)) {
      this.updateBattery(state, intervalMs, false);
      return null;
    }

    // Jitter du timestamp ±5% intervalle
    const jitterMs = Math.round((intervalMs * 0.05) * (state.rng.range(-1, 1)));
    const ts = new Date(nowMs + jitterMs).toISOString();

    // Scénarios météo globaux
    this.maybeRotateScenario(nowMs, intervalMs);
    const infl = this.scenarioInfluence(nowMs);

    // Generators
    this.maybeMaintenance(state, nowMs, intervalMs);
    const temp = this.generateTemperature(state, now, { dT: infl.dT });
    const humidity = this.generateHumidity(temp, { dHumidity: infl.dHumidity });
    const air = this.generateAirQuality(temp, humidity, now, { dAir: infl.dAir });
    const soil = this.generateSoilMoisture(state, { dSoilFactor: infl.dSoilFactor }, intervalMs, temp);
    const water = this.generateWaterQuality(state, { dWater: infl.dWater });

    // Anomalies / pannes par type
    const readings: SensorReading[] = [];
    const maybePush = (idSuffix: string, type: string, unit: string, value: number) => {
      const v1 = this.applyPlateauIfNeeded(state, nowMs, value);
      const v2 = this.maybeApplyOutlier(type, v1, state.rng);
      if (v2 === 'drop') return; // panne: omettre cette lecture uniquement
      const reading: SensorReading = {
        id: `${sensor.id}-${idSuffix}`,
        type,
        value: v2,
        unit,
        timestamp: ts,
        location: { ...state.location },
        batteryLevel: Math.round(state.batteryLevel),
        metadata: {
          accuracy: clamp(Math.round(state.accuracy + state.rng.normal(0, 1)), 90, 99),
          readingInterval: intervalMs,
        }
      };
      readings.push(reading);
    };

    if (multiMetric) {
      maybePush('temperature', 'temperature', '°C', temp);
      maybePush('humidity', 'humidity', '%', humidity);
      maybePush('airQuality', 'airQuality', 'CAQI', air);
      maybePush('waterQuality', 'waterQuality', 'WQI', water);
      maybePush('soilMoisture', 'soilMoisture', '%', soil);
    } else {
      // Mono-mesure: aligner le type de lecture avec le type DB du capteur
      if (sensor.type === 'TEMPERATURE') {
        maybePush('temperature', 'temperature', '°C', temp);
      } else if (sensor.type === 'HUMIDITY') {
        maybePush('humidity', 'humidity', '%', humidity);
      } else if (sensor.type === 'AIR_QUALITY') {
        maybePush('airQuality', 'airQuality', 'CAQI', air);
      } else if (sensor.type === 'PRESSURE' || sensor.type === 'NOISE_LEVEL') {
        // Non supportés par le MVP: ne rien publier pour ce capteur
        return null;
      }
    }

    // Mise à jour batterie (succès publication présumé ici, ajusté si MQTT échoue côté publisher callback non disponible ici)
    this.updateBattery(state, intervalMs, true);
    state.lastTickMs = nowMs;

    return {
      sensorId: sensor.id,
      readings,
      deviceInfo: {
        id: `device-${sensor.id}`,
        model: 'EcoWatchSensor-v2',
        firmware: '2.0.0'
      }
    };
  }

  public generateAllSensorsData(): EnvironmentalData[] {
    if (this.sensors.length === 0) {
      console.warn('No sensors available. Did you call initialize()?');
      return [];
    }
    const results: EnvironmentalData[] = [];
    for (const sensor of this.sensors) {
      if (sensor.organization.bucketSyncStatus !== 'ACTIVE') continue;
      const data = this.generateSensorData(sensor);
      if (data && data.readings.length > 0) results.push(data);
    }
    return results;
  }

  public getSensorsInfo() {
    return this.sensors.map(sensor => ({
      id: sensor.id,
      name: sensor.name,
      type: sensor.type,
      organization: sensor.organization.name,
      bucketStatus: sensor.organization.bucketSyncStatus
    }));
  }
}