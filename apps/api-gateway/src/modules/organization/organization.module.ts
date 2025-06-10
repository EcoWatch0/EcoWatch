import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { influxdbConfig, InfluxDBModule, PrismaModule } from '@ecowatch/shared';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    InfluxDBModule,
    PrismaModule,
    ConfigModule.forFeature(influxdbConfig)
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule { } 