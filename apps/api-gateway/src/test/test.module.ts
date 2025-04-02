import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { PrismaModule } from '@ecowatch/shared';

@Module({
  imports: [PrismaModule],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {} 