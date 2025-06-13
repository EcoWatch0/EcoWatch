import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { PrismaModule } from '@ecowatch/shared/src/service/prisma/prisma.module';
import { InfluxDBModule } from '@ecowatch/shared/src/service/influxdb/influxdb.module';

@Module({
  imports: [
    InfluxDBModule,
    PrismaModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule { } 