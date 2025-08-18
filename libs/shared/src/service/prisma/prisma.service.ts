import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


const logger = new Logger('PrismaService');
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    logger.log('Disconnected from database');
  }
} 