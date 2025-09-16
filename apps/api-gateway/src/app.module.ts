import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [UserModule, AuthModule, OrganizationModule, MetricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { } 