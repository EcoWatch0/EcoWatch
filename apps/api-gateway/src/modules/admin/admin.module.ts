import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '@ecowatch/shared';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
})
export class AdminModule {}

