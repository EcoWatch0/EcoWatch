import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { InfluxDBModule, OrganisationsModule, PrismaModule } from '@ecowatch/shared';

@Module({
  imports: [
    InfluxDBModule,
    PrismaModule,
    OrganisationsModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule { } 