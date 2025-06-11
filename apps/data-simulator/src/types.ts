// Environmental sensor data types

export type SensorType = 'TEMPERATURE' | 'HUMIDITY' | 'AIR_QUALITY' | 'PRESSURE' | 'NOISE_LEVEL';

export interface SensorReading {
  id: string;
  type: string; // Will map to SensorType from Prisma
  value: number;
  unit: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    name?: string;
  };
  batteryLevel?: number;
  metadata?: Record<string, any>;
}

export interface EnvironmentalData {
  sensorId: string;
  readings: SensorReading[];
  deviceInfo: {
    id: string;
    model: string;
    firmware: string;
  };
}

// Interface pour les capteurs de la base de données
export interface DatabaseSensor {
  id: string;
  name: string;
  type: SensorType;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    influxBucketName: string | null;
    bucketSyncStatus: string;
  };
} 