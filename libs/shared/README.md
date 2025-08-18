# @ecowatch/shared

Librairie partagée contenant:

- Modules Prisma (`PrismaModule`, `PrismaService`)
- Modules InfluxDB (`InfluxDBModule`, `InfluxDBService`, `InfluxDBBucketService`)
- Interactors (services) de domaine: `UsersService`, `OrganisationsService`, `SensorsService`
- Configurations (`influxdb.config`, `mqtt.config`, `data-faker.config`)

## Installation locale

```bash
pnpm install
pnpm -r build # construit la lib et les dépendants si nécessaire
```

## Export principaux

Voir `src/index.ts` pour la liste des exports. Exemple d’usage dans une app Nest:

```ts
import { PrismaModule, UsersService } from '@ecowatch/shared';
```

## Variables d’environnement

- InfluxDB: `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_ORG_ID`, `INFLUXDB_BUCKET`
- MQTT (simulateur): `MQTT_BROKER_URL`, `MQTT_CLIENT_ID`, `MQTT_USERNAME`, `MQTT_PASSWORD`
- Data faker: `DATA_FAKER_INTERVAL_MS`, `DATA_FAKER_SENSORS_COUNT`


