import { Module } from '@nestjs/common';
import { SensorController } from './sensor.controller';
import { SensorsModule } from '@ecowatch/shared';

@Module({
  imports: [SensorsModule],
  controllers: [SensorController],
})
export class SensorModule { }

