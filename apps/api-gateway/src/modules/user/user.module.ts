import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '@ecowatch/shared';
import { UsersModule } from '@ecowatch/shared';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { } 