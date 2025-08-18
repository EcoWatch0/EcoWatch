# MQTT→InfluxDB Service

Consomme des messages MQTT et écrit des points dans InfluxDB, avec bufferisation et flush par lot.

## Démarrage

```bash
pnpm install
pnpm dev
# ou
pnpm build && pnpm start
```

## Variables d’environnement

- `APP_MQTT_INFLUXDB_SERVICE_PORT=3002`
- `MQTT_BROKER_URL`, `MQTT_CLIENT_ID`, `MQTT_TOPIC`, `MQTT_QOS`
- `BATCH_SIZE`, `BATCH_INTERVAL`, `MAX_RETRIES`, `FAILED_MESSAGES_PATH`
- `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_ORG_ID`

## Flux de traitement

1. Connexion MQTT et abonnement aux topics
2. Validation et transformation des messages de capteurs
3. Bufferisation par bucket d’organisation
4. Écriture par lot dans InfluxDB


