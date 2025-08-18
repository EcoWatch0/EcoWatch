# Data Simulator

Génère des données environnementales de capteurs et les publie via MQTT.

## Démarrage

```bash
pnpm install
pnpm dev
# ou
pnpm build && pnpm start
```

## Variables d’environnement

- `MQTT_BROKER_URL`, `MQTT_CLIENT_ID`, `MQTT_USERNAME`, `MQTT_PASSWORD`
- `DATA_FAKER_INTERVAL_MS`, `DATA_FAKER_SENSORS_COUNT`

## Topics MQTT

- Publication: `ecowatch/sensors/{sensorId}/data`


