import { SensorType } from "../enum/sensor.enum";


/**
 * Represents a single sensor reading with metadata
 */
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

/**
 * Represents a complete set of environmental data from a sensor device
 */
export interface EnvironmentalData {
    sensorId: string;
    readings: SensorReading[];
    deviceInfo: {
        id: string;
        model: string;
        firmware: string;
    };
}

/**
 * Represents a point to be written to InfluxDB
 */
export interface InfluxPoint {
    measurement: string;
    tags: Record<string, string>;
    fields: Record<string, any>;
} 