# @ecowatch/shared

Librairie partagée NestJS: modules Prisma, InfluxDB et interactors de domaine (users, organisations, sensors), plus des configurations.

## Exports

Voir `libs/shared/src/index.ts`.

```ts
export * from './service/prisma/prisma.module';
export * from './service/prisma/prisma.service';
export * from './service/influxdb/influxdb.module';
export * from './service/influxdb/influxdb.service';
export * from './service/influxdb/interface/influxdb-bucket.interface';
export * from './service/influxdb/influxdb-bucket.service';
export * from './interactors/users/users.service';
export * from './interactors/organisations/organisations.service';
export * from './interactors/sensors/sensors.service';
export * from './config/influxdb.config';
export * from './config/mqtt.config';
export * from './config/data-faker.config';
```

## Variables d’environnement

- InfluxDB: `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_ORG_ID`, `INFLUXDB_BUCKET`
- MQTT (simulateur): `MQTT_BROKER_URL`, `MQTT_CLIENT_ID`, `MQTT_USERNAME`, `MQTT_PASSWORD`
- Data faker: `DATA_FAKER_INTERVAL_MS`, `DATA_FAKER_SENSORS_COUNT`

## Exemple d’utilisation

```ts
import { PrismaModule, UsersService } from '@ecowatch/shared';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
})
export class UserModule {}
```


