import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfluxDBService } from './influxdb.service';
import { InfluxDBBucketService } from './influxdb-bucket.service';
import { influxdbConfig } from './influxdb.config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forFeature(influxdbConfig),
    PrismaModule
  ],
  providers: [
    InfluxDBService,
    InfluxDBBucketService
  ],
  exports: [
    InfluxDBService,
    InfluxDBBucketService
  ],
})
export class InfluxDBModule { } 