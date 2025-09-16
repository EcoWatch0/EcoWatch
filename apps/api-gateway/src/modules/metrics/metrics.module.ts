import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { InfluxDBModule } from '@ecowatch/shared';

@Module({
  imports: [InfluxDBModule],
  controllers: [MetricsController],
})
export class MetricsModule { }

