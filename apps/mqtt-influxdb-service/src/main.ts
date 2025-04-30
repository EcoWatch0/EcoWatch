import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('Starting MQTT-to-InfluxDB service...');
  
  // Debug environment variables
  logger.log(`Environment variables check:`);
  logger.log(`INFLUXDB_TOKEN=${process.env.INFLUXDB_TOKEN ? '***' + process.env.INFLUXDB_TOKEN.substring(process.env.INFLUXDB_TOKEN.length - 5) : 'NOT SET'}`);
  logger.log(`INFLUXDB_URL=${process.env.INFLUXDB_URL || 'NOT SET'}`);
  logger.log(`INFLUXDB_ORG=${process.env.INFLUXDB_ORG || 'NOT SET'}`);
  logger.log(`INFLUXDB_BUCKET=${process.env.INFLUXDB_BUCKET || 'NOT SET'}`);
  
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    // Get MQTT configuration from environment variables with fallbacks
    const mqttConfig = {
      url: configService.get('MQTT_URL', 'mqtt://localhost:1883'),
      clientId: configService.get('MQTT_CLIENT_ID', 'mqtt-influxdb-service'),
      username: configService.get('MQTT_USERNAME', 'admin'),
      password: configService.get('MQTT_PASSWORD', 'admin'),
      reconnectPeriod: 5000, // Reconnect after 5 seconds
      connectTimeout: 10000, // 10 seconds connection timeout
    };
    
    logger.log(`Connecting to MQTT broker at ${mqttConfig.url}`);
    
    // Connect as microservice
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.MQTT,
      options: mqttConfig,
    });
    
    // Start microservice
    await app.startAllMicroservices();
    logger.log('MQTT to InfluxDB microservice is running');
    
    // Handle shutdown signals
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.log(`Received ${signal} signal, shutting down gracefully...`);
        await app.close();
        logger.log('Application shutdown complete');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error(`Failed to start microservice: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

bootstrap(); 