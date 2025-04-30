import { Injectable, OnModuleDestroy, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { InfluxDBService } from '@ecowatch/shared';
import { mqttConfig, serviceConfig } from '../config';
// Interface pour les lectures de capteurs (basée sur le format du simulateur)
interface SensorReading {
  id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    name?: string;
  };
  batteryLevel?: number;
  metadata?: Record<string, any>;
}

// Interface pour les données environnementales complètes
interface EnvironmentalData {
  sensorId: string;
  readings: SensorReading[];
  deviceInfo: {
    id: string;
    model: string;
    firmware: string;
  };
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);
  private connected = false;
  private connectionRetries = 0;
  private readonly MAX_RETRIES: number;
  private readonly BATCH_SIZE: number;
  private readonly BATCH_INTERVAL: number;
  private dataBuffer: Array<{ measurement: string, tags: Record<string, string>, fields: Record<string, any> }> = [];
  private processingTimer: NodeJS.Timeout | null = null;

  constructor(
    private influxDBService: InfluxDBService,
    private configService: ConfigService,
    @Inject(mqttConfig.KEY)
    private readonly mqttConfigService: ConfigType<typeof mqttConfig>,
    @Inject(serviceConfig.KEY)
    private readonly serviceConfigService: ConfigType<typeof serviceConfig>,
  ) {
    // Initialize configuration values
    this.MAX_RETRIES = this.serviceConfigService.maxRetries;
    this.BATCH_SIZE = this.serviceConfigService.batchSize;
    this.BATCH_INTERVAL = this.serviceConfigService.batchInterval;
    
    // Set log level
    Logger.overrideLogger(this.serviceConfigService.logLevel as any);
  }

  onModuleInit() {
    this.connectToMqtt();
    // Set up buffer flush interval
    this.startPeriodicBufferFlush();
  }

  private startPeriodicBufferFlush() {
    // Flush buffer based on the interval from configuration
    this.logger.log(`Setting up periodic buffer flush every ${this.BATCH_INTERVAL}ms`);
    this.processingTimer = setInterval(() => {
      this.flushBuffer();
    }, this.BATCH_INTERVAL);
  }

  private async flushBuffer() {
    if (this.dataBuffer.length === 0) return;
    
    try {
      const batchSize = Math.min(this.BATCH_SIZE, this.dataBuffer.length);
      const batch = this.dataBuffer.splice(0, batchSize);
      
      this.logger.log(`Flushing buffer with ${batch.length} points to InfluxDB`);
      
      // Process points in parallel with a concurrency limit
      const results = await Promise.allSettled(
        batch.map(point => 
          this.influxDBService.writePoint(
            point.measurement,
            point.tags,
            point.fields
          )
        )
      );
      
      // Count successes and failures
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      this.logger.log(`Buffer flush complete: ${successful} successful, ${failed} failed`);
      
      // If there were failures, log them
      if (failed > 0) {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            this.logger.error(`Failed to write point: ${(result as PromiseRejectedResult).reason}`);
          }
        });
      }
    } catch (error) {
      this.logger.error(`Error flushing buffer: ${error.message}`);
    }
  }

  private connectToMqtt() {
    this.logger.log(`Connecting to MQTT broker at ${this.mqttConfigService.brokerUrl}`);
    
    const options: mqtt.IClientOptions = {
      clientId: `${this.mqttConfigService.clientId}-${Date.now()}`, // Ensure unique client ID
      clean: true,
      reconnectPeriod: this.mqttConfigService.reconnectPeriod,
      rejectUnauthorized: false, // Might need to be true in production with proper certs
      keepalive: 60,
    };
    
    // Add credentials if provided
    if (this.mqttConfigService.username && this.mqttConfigService.password) {
      options.username = this.mqttConfigService.username;
      options.password = this.mqttConfigService.password;
    }
    
    this.client = mqtt.connect(this.mqttConfigService.brokerUrl, options);
    
    this.client.on('connect', () => {
      this.connected = true;
      this.connectionRetries = 0;
      this.logger.log('Connected to MQTT broker successfully');
      this.subscribeToTopics();
    });
    
    this.client.on('error', (error) => {
      this.connected = false;
      this.logger.error(`MQTT connection error: ${error.message}`);
    });
    
    this.client.on('close', () => {
      this.connected = false;
      this.logger.warn('MQTT connection closed');
    });
    
    this.client.on('reconnect', () => {
      this.connectionRetries++;
      this.logger.warn(`Attempting to reconnect to MQTT broker (attempt ${this.connectionRetries}/${this.MAX_RETRIES})...`);
      
      // If exceeded max retries, stop trying
      if (this.connectionRetries > this.MAX_RETRIES) {
        this.logger.error(`Max reconnection attempts (${this.MAX_RETRIES}) reached. Stopping reconnection attempts.`);
        this.client.end(true);
      }
    });
    
    this.client.on('message', this.handleMessage.bind(this));
  }

  private subscribeToTopics() {
    // Can subscribe to multiple topics if needed
    const topics = Array.isArray(this.mqttConfigService.topic) 
      ? this.mqttConfigService.topic 
      : [this.mqttConfigService.topic];
    
    topics.forEach(topic => {
      // Use a default QoS of 0 if not specified in config
      const qos = (this.mqttConfigService as any).qos ?? 0;
      
      this.client.subscribe(topic, { qos }, (err) => {
        if (err) {
          this.logger.error(`Error subscribing to topic ${topic}: ${err.message}`);
        } else {
          this.logger.log(`Subscribed to topic: ${topic} (QoS: ${qos})`);
        }
      });
    });
  }

  private async handleMessage(topic: string, message: Buffer) {
    try {
      this.logger.debug(`Received message on topic: ${topic}`);
      
      // Process only sensor messages
      if (topic.includes('ecowatch/sensors') && topic.includes('/data')) {
        try {
          const messageStr = message.toString();
          const data = JSON.parse(messageStr) as EnvironmentalData;
          
          // Validate message format
          if (!this.validateMessage(data)) {
            this.logger.warn(`Invalid message format: ${messageStr.substring(0, 200)}...`);
            return;
          }
          
          await this.processEnvironmentalData(data);
        } catch (parseError) {
          this.logger.error(`Error parsing message: ${parseError.message}`);
          // Could store failed messages for later analysis
        }
      }
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
    }
  }

  private validateMessage(data: any): boolean {
    // Basic validation to ensure the message has required fields
    return (
      data &&
      data.sensorId &&
      Array.isArray(data.readings) &&
      data.readings.length > 0 &&
      data.deviceInfo?.id
    );
  }

  private async processEnvironmentalData(data: EnvironmentalData) {
    try {
      this.logger.log(`Processing data from sensor: ${data.sensorId} (${data.readings.length} readings)`);
      
      // For each sensor reading, create a point
      for (const reading of data.readings) {
        // Add to buffer instead of writing directly
        this.dataBuffer.push({
          measurement: 'environmental_data',
          tags: {
            sensorId: data.sensorId,
            type: reading.type,
            unit: reading.unit,
            deviceId: data.deviceInfo.id,
            model: data.deviceInfo.model,
            firmware: data.deviceInfo.firmware,
            latitude: reading.location.lat.toString(),
            longitude: reading.location.lng.toString(),
            locationName: reading.location.name || 'Unknown',
          },
          fields: {
            value: reading.value,
            batteryLevel: reading.batteryLevel || 0,
            timestamp: new Date(reading.timestamp).getTime(),
          }
        });
      }
      
      // If buffer reaches threshold, flush it
      if (this.dataBuffer.length >= this.BATCH_SIZE) {
        this.flushBuffer();
      }
      
      this.logger.debug(`Added ${data.readings.length} readings to buffer (current size: ${this.dataBuffer.length})`);
    } catch (error) {
      this.logger.error(`Error processing environmental data: ${error.message}`);
    }
  }

  onModuleDestroy() {
    return new Promise<void>(async (resolve) => {
      try {
        // Clear the timer
        if (this.processingTimer) {
          clearInterval(this.processingTimer);
        }
        
        // Final flush of any remaining data
        if (this.dataBuffer.length > 0) {
          this.logger.log(`Final flush of ${this.dataBuffer.length} points before shutdown`);
          await this.flushBuffer();
        }
        
        // Close MQTT connection
        if (this.client) {
          this.logger.log('Closing MQTT connection');
          this.client.end(false, {}, () => {
            this.logger.log('MQTT connection closed');
            resolve();
          });
        } else {
          resolve();
        }
      } catch (error) {
        this.logger.error(`Error during shutdown: ${error.message}`);
        resolve();
      }
    });
  }
} 