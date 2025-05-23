import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || 'eco-watch-data-simulator',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  },
  simulation: {
    intervalMs: parseInt(process.env.SIMULATION_INTERVAL_MS || '5000', 10),
    sensorsCount: parseInt(process.env.SENSORS_COUNT || '5', 10),
  },
}; 