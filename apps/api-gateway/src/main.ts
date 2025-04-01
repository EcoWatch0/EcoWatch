import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app: INestApplication = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Préfixe global pour l'API
  app.setGlobalPrefix('api');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('EcoWatch API')
    .setDescription('Documentation de l\'API EcoWatch')
    .setVersion('1.0')
    .addTag('ecowatch')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/docs`);
}
bootstrap(); 