import { registerAs } from '@nestjs/config';

export const mqttConfig = registerAs('mqtt', () => ({
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || 'eco-watch-data-simulator',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
}));