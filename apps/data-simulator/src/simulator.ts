import { SensorReading, SensorType, EnvironmentalData } from './types';
import { config } from './config';

// Generation des données aléatoires
export class DataSimulator {
  private sensorIds: string[] = [];

  constructor() {
    // Initialiser les IDs des capteurs
    for (let i = 0; i < config.simulation.sensorsCount; i++) {
      this.sensorIds.push(`sensor-${i + 1}`);
    }
  }

  // Générer une lecture aléatoire pour un type de capteur
  private generateReading(sensorId: string, type: SensorType): SensorReading {
    const now = new Date();

    // Définir les plages de valeurs et unités en fonction du type de capteur
    let value: number;
    let unit: string;

    switch (type) {
      case 'temperature':
        value = this.randomInRange(15, 35); // °C
        unit = '°C';
        break;
      case 'humidity':
        value = this.randomInRange(30, 90); // %
        unit = '%';
        break;
      case 'airQuality':
        value = this.randomInRange(0, 500); // AQI
        unit = 'AQI';
        break;
      case 'waterQuality':
        value = this.randomInRange(0, 14); // pH
        unit = 'pH';
        break;
      case 'soilMoisture':
        value = this.randomInRange(0, 100); // %
        unit = '%';
        break;
    }

    // Générer des coordonnées géographiques autour de Paris (pour l'exemple)
    const lat = this.randomInRange(48.8, 48.9);
    const lng = this.randomInRange(2.3, 2.4);

    return {
      id: `${sensorId}-${type}`,
      type,
      value,
      unit,
      timestamp: now.toISOString(),
      location: {
        lat,
        lng,
        name: `Location ${sensorId}`
      },
      batteryLevel: this.randomInRange(10, 100),
      metadata: {
        accuracy: this.randomInRange(90, 99),
        readingInterval: config.simulation.intervalMs
      }
    };
  }

  // Générer des données complètes pour un capteur
  public generateSensorData(sensorId: string): EnvironmentalData {
    // Liste des types de capteurs à simuler
    const sensorTypes: SensorType[] = ['temperature', 'humidity', 'airQuality', 'waterQuality', 'soilMoisture'];

    // Générer des lectures pour chaque type
    const readings = sensorTypes.map(type => this.generateReading(sensorId, type));

    return {
      sensorId,
      readings,
      deviceInfo: {
        id: `device-${sensorId}`,
        model: 'EcoWatchSensor-v1',
        firmware: '1.0.0'
      }
    };
  }

  // Générer des données pour tous les capteurs
  public generateAllSensorsData(): EnvironmentalData[] {
    return this.sensorIds.map(id => this.generateSensorData(id));
  }

  // Utilitaire pour générer un nombre aléatoire dans une plage
  private randomInRange(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
  }
} 