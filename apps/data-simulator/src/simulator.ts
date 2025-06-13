import { SensorReading, EnvironmentalData, DatabaseSensor } from './types';
import { DatabaseService } from './database.service';
import { dataFakerConfig } from '@ecowatch/shared/src/config/data-faker.config';

// Generation des données aléatoires
export class DataSimulator {
  private sensors: DatabaseSensor[] = [];

  constructor(
    private databaseService: DatabaseService,
  ) { }

  /**
   * Initialise les capteurs depuis la base de données
   */
  async initialize() {
    console.log('Initializing simulator with database sensors...');

    // Créer des capteurs de test si nécessaire
    await this.databaseService.createTestSensors();

    // Récupérer les capteurs actifs
    this.sensors = await this.databaseService.getActiveSensors();


    console.log(`Found ${this.sensors.length} active sensors`);
    this.sensors.forEach(sensor => {
      console.log(`  - ${sensor.name} (${sensor.type}) - Org: ${sensor.organization.name}`);
    });
  }

  // Générer une lecture aléatoire pour un capteur spécifique
  private generateReading(sensor: DatabaseSensor): SensorReading {
    const now = new Date();

    // Définir les plages de valeurs et unités en fonction du type de capteur
    let value: number;
    let unit: string;

    switch (sensor.type) {
      case 'TEMPERATURE':
        value = this.randomInRange(15, 35); // °C
        unit = '°C';
        break;
      case 'HUMIDITY':
        value = this.randomInRange(30, 90); // %
        unit = '%';
        break;
      case 'AIR_QUALITY':
        value = this.randomInRange(0, 500); // AQI
        unit = 'AQI';
        break;
      case 'PRESSURE':
        value = this.randomInRange(990, 1030); // hPa
        unit = 'hPa';
        break;
      case 'NOISE_LEVEL':
        value = this.randomInRange(30, 100); // dB
        unit = 'dB';
        break;
      default:
        value = this.randomInRange(0, 100);
        unit = 'unknown';
    }

    // Utiliser les coordonnées du capteur ou des coordonnées par défaut
    const lat = sensor.latitude || this.randomInRange(48.8, 48.9);
    const lng = sensor.longitude || this.randomInRange(2.3, 2.4);

    return {
      id: `${sensor.id}-${sensor.type}`,
      type: sensor.type,
      value,
      unit,
      timestamp: now.toISOString(),
      location: {
        lat,
        lng,
        name: sensor.location || `Location ${sensor.id}`
      },
      batteryLevel: this.randomInRange(10, 100),
      metadata: {
        accuracy: this.randomInRange(90, 99),
        readingInterval: dataFakerConfig().intervalMs,
        sensorName: sensor.name,
        organizationId: sensor.organizationId
      }
    };
  }

  // Générer des données complètes pour un capteur
  public generateSensorData(sensor: DatabaseSensor): EnvironmentalData {
    // Générer une lecture pour ce capteur spécifique
    const reading = this.generateReading(sensor);

    return {
      sensorId: sensor.id,
      readings: [reading], // Un seul type de reading par capteur
      deviceInfo: {
        id: `device-${sensor.id}`,
        model: 'EcoWatchSensor-v2',
        firmware: '2.0.0'
      }
    };
  }

  // Générer des données pour tous les capteurs actifs
  public generateAllSensorsData(): EnvironmentalData[] {
    if (this.sensors.length === 0) {
      console.warn('No sensors available. Did you call initialize()?');
      return [];
    }

    return this.sensors
      .filter(sensor => sensor.organization.bucketSyncStatus === 'ACTIVE') // Seuls les capteurs avec bucket actif
      .map(sensor => this.generateSensorData(sensor));
  }

  // Obtenir les informations des capteurs chargés
  public getSensorsInfo() {
    return this.sensors.map(sensor => ({
      id: sensor.id,
      name: sensor.name,
      type: sensor.type,
      organization: sensor.organization.name,
      bucketStatus: sensor.organization.bucketSyncStatus
    }));
  }

  // Utilitaire pour générer un nombre aléatoire dans une plage
  private randomInRange(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
  }
} 