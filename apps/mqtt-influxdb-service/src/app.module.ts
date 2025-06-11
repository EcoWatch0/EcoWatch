import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { influxdbConfig, InfluxDBModule, PrismaModule } from '@ecowatch/shared';
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