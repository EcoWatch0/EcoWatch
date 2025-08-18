import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

/**
 * Crée le dossier de stockage des messages en échec si nécessaire
 */
function ensureFailedMessagesDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    Logger.log(`Created directory for failed messages: ${dirPath}`, 'Bootstrap');
  }
}


async function bootstrap() {
  const logger = new Logger('Bootstrap');

  logger.log('Starting MQTT-to-InfluxDB service...');

  try {
    // Afficher les informations de diagnostic

    // Créer l'application NestJS
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Vérifier que le dossier pour les messages en échec existe
    const failedMessagesPath = configService.get<string>('service.failedMessagesPath', './failed-messages');
    ensureFailedMessagesDir(failedMessagesPath);

    // Démarrer l'application
    await app.listen(configService.get<number>('APP_MQTT_INFLUXDB_SERVICE_PORT', 3002));

    const appUrl = await app.getUrl();
    logger.log(`MQTT to InfluxDB service is running on: ${appUrl}`);
    logger.log(`Service is listening to MQTT topics: ${configService.get('mqtt.topic')}`);

    // Activer la surveillance de la mémoire
    const memoryCheckInterval = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = Math.round(memoryUsage.rss / 1024 / 1024);
      logger.debug(`Memory usage: ${memoryUsageMB} MB`);

      // Alerte si l'utilisation de la mémoire est trop élevée
      const memoryThresholdMB = 500; // 500 MB
      if (memoryUsageMB > memoryThresholdMB) {
        logger.warn(`High memory usage detected: ${memoryUsageMB} MB`);
      }
    }, 60000); // Vérifier toutes les minutes

    // Gérer les signaux d'arrêt
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.log(`Received ${signal} signal, shutting down gracefully...`);

        // Arrêter la surveillance de la mémoire
        clearInterval(memoryCheckInterval);

        // Fermer l'application NestJS
        await app.close();

        logger.log('Application shutdown complete');
        process.exit(0);
      });
    });

    // Gestionnaire d'erreurs non capturées
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught exception: ${error.message}`);
      logger.error(error.stack);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise);
      logger.error('Reason:', reason);
    });

  } catch (error) {
    logger.error(`Failed to start service: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

bootstrap(); 