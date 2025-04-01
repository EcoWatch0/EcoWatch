import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfluxDBService } from './influxdb.service';
import { influxdbConfig } from './influxdb.config';

@Module({
  imports: [ConfigModule.forFeature(influxdbConfig)],
  providers: [InfluxDBService],
  exports: [InfluxDBService],
})
export class InfluxDBModule {} 