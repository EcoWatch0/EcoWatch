# MQTT → InfluxDB Service

Microservice NestJS qui consomme des messages MQTT et écrit des points dans InfluxDB (un bucket par organisation).

## Démarrage

```bash
pnpm install
pnpm dev
# ou
pnpm build && pnpm start
```

Par défaut, le service écoute sur `http://localhost:3002`.

## Variables d’environnement

- Service
  - `APP_MQTT_INFLUXDB_SERVICE_PORT=3002`
  - `BATCH_SIZE=100` (points par flush)
  - `BATCH_INTERVAL=5000` (ms)
  - `MAX_RETRIES=5`
  - `FAILED_MESSAGES_PATH=./failed-messages`

- MQTT
  - `MQTT_BROKER_URL=mqtt://localhost:1883`
  - `MQTT_CLIENT_ID=mqtt-influxdb-service`
  - `MQTT_USERNAME`, `MQTT_PASSWORD` (optionnel)
  - `MQTT_TOPIC=ecowatch/#` (ou liste séparée par des virgules)
  - `MQTT_QOS=1`

- InfluxDB
  - `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_ORG_ID`

## Fonctionnement

1. Connexion au broker MQTT et abonnement aux topics configurés (par défaut `ecowatch/#`).
2. Validation des messages de type `ecowatch/sensors/{sensorId}/data`.
3. Mise en buffer par bucket d’organisation, flush périodique ou par lot (`BATCH_SIZE`).
4. Écriture dans InfluxDB via `InfluxDBService` (libs/shared).

Les points écrits incluent des tags (sensor_id, organization_id, type, unit, device_id, latitude, longitude, etc.) et des fields (value, battery_level, timestamp, ...).

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm lint
```


