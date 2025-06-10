import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MqttService } from './mqtt.service';
import { PrismaModule, InfluxDBModule } from '@ecowatch/shared';
import { mqttConfig, serviceConfig } from 'src/config';

@Module({
  imports: [
    ConfigModule.forFeature(mqttConfig),
    ConfigModule.forFeature(serviceConfig),
    InfluxDBModule,
    PrismaModule,
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule { } 