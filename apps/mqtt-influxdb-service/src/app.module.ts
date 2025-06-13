import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@ecowatch/shared/src/service/prisma/prisma.module';
import { InfluxDBModule } from '@ecowatch/shared/src/service/influxdb/influxdb.module';
import { influxdbConfig } from '@ecowatch/shared/src/config/influxdb.config';
import { MqttModule } from './mqtt/mqtt.module';
import { mqttConfig, serviceConfig } from './config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [mqttConfig, influxdbConfig, serviceConfig],
    }),
    InfluxDBModule,
    MqttModule,
    PrismaModule,
  ],
})
export class AppModule { } 