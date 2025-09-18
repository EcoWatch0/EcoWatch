import { registerAs } from "@nestjs/config";

/**
 * Configuration MQTT pour la connexion au broker
 */
export const mqttConfig = registerAs('mqtt', () => ({
    // URL du broker MQTT
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',

    // ID du client MQTT (doit être unique sur le broker)
    clientId: process.env.MQTT_CLIENT_ID || 'mqtt-influxdb-service',

    // Identifiants d'authentification (optionnels)
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,

    // Topic(s) à écouter - peut être une chaîne ou un tableau de chaînes
    // Exemples:
    // - 'ecowatch/#' (tous les topics sous ecowatch)
    // - ['ecowatch/sensors/+/data', 'ecowatch/alerts/#']
    topic: process.env.MQTT_TOPIC?.split(',') || 'ecowatch/#',

    // Niveau de QoS pour les abonnements (0, 1 ou 2)
    qos: parseInt(process.env.MQTT_QOS || '1', 10),

    // Période de reconnexion en ms
    reconnectPeriod: parseInt(process.env.MQTT_RECONNECT_PERIOD || '5000', 10),

    // Activer le mode sécurisé (TLS/SSL)
    secure: process.env.MQTT_SECURE === 'true',

    // Chemins des certificats SSL (si secure est true)
    certPath: process.env.MQTT_CERT_PATH,
    keyPath: process.env.MQTT_KEY_PATH,
    caPath: process.env.MQTT_CA_PATH,
}));

/**
 * Configuration du service pour le traitement des données
 */
export const serviceConfig = registerAs('service', () => ({
    // Nombre de points à envoyer en une seule fois à InfluxDB
    batchSize: parseInt(process.env.BATCH_SIZE || '10000', 10),

    // Intervalle de vidage du buffer en ms
    batchInterval: parseInt(process.env.BATCH_INTERVAL || '5000', 10),

    // Niveau de logging (log, error, warn, debug, verbose)
    logLevel: process.env.LOG_LEVEL || 'log',

    // Nombre maximal de tentatives de reconnexion
    maxRetries: parseInt(process.env.MAX_RETRIES || '5', 10),

    // Activer la détection des anomalies
    enableAnomalyDetection: process.env.ENABLE_ANOMALY_DETECTION !== 'false',

    // Chemin du dossier pour stocker les messages en échec
    failedMessagesPath: process.env.FAILED_MESSAGES_PATH || './failed-messages',

    // Limite de mémoire pour le buffer (en nombre de messages)
    bufferMemoryLimit: parseInt(process.env.BUFFER_MEMORY_LIMIT || '10000', 10),

    // Stratégie en cas de dépassement de la limite de mémoire (drop_oldest, drop_newest, block)
    bufferLimitStrategy: process.env.BUFFER_LIMIT_STRATEGY || 'drop_oldest',
}));