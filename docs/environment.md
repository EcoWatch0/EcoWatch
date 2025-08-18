# Variables d’environnement

## Communes

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecowatch`
- `JWT_SECRET=change-me`
- `INFLUXDB_URL=http://localhost:8086`
- `INFLUXDB_TOKEN=...`
- `INFLUXDB_ORG=...`
- `INFLUXDB_ORG_ID=...`
- `INFLUXDB_BUCKET=...`

Scripts utiles:

```bash
pnpm env:copy:local
pnpm env:copy:prod
pnpm env:clean
```

## API Gateway

- `API_PORT=3001`
- `FRONTEND_URL=http://localhost:3000`
- `DATABASE_URL`, `JWT_SECRET`

## Web

- `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

## MQTT→InfluxDB Service

- `APP_MQTT_INFLUXDB_SERVICE_PORT=3002`
- `MQTT_BROKER_URL=mqtt://localhost:1883`
- `MQTT_CLIENT_ID=mqtt-influxdb-service`
- `MQTT_TOPIC=ecowatch/#` (ou liste séparée par virgules)
- `MQTT_QOS=1`
- `BATCH_SIZE=100`
- `BATCH_INTERVAL=5000`
- `MAX_RETRIES=5`
- `FAILED_MESSAGES_PATH=./failed-messages`
- `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_ORG_ID`

## Data Simulator

- `MQTT_BROKER_URL=mqtt://localhost:1883`
- `MQTT_CLIENT_ID=eco-watch-data-simulator`
- `MQTT_USERNAME`, `MQTT_PASSWORD`
- `DATA_FAKER_INTERVAL_MS=5000`
- `DATA_FAKER_SENSORS_COUNT=5`


