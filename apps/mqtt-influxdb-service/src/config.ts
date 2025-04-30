import { registerAs } from "@nestjs/config";

export const mqttConfig = registerAs('mqtt', () => ({
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || 'mqtt-influxdb-service',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    topic: process.env.MQTT_TOPIC || 'ecowatch/#',
    reconnectPeriod: parseInt(process.env.MQTT_RECONNECT_PERIOD || '5000', 10),
}));

export const serviceConfig = registerAs('service', () => ({
    batchSize: parseInt(process.env.BATCH_SIZE || '100', 10),
    batchInterval: parseInt(process.env.BATCH_INTERVAL || '5000', 10),
    logLevel: process.env.LOG_LEVEL || 'log',
    maxRetries: parseInt(process.env.MAX_RETRIES || '5', 10)
}))