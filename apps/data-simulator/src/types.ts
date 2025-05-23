// Environmental sensor data types

export type SensorType = 'temperature' | 'humidity' | 'airQuality' | 'waterQuality' | 'soilMoisture';

export interface SensorReading {
  id: string;
  type: SensorType;
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