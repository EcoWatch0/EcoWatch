import { Injectable, OnModuleDestroy, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { InfluxDBService, PrismaService } from '@ecowatch/shared';
import { mqttConfig, serviceConfig } from '../config';
import { SensorReading, EnvironmentalData, InfluxPoint } from '@ecowatch/shared';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);
  private connected = false;
  private connectionRetries = 0;
  private readonly MAX_RETRIES: number;
  private readonly BATCH_SIZE: number;
  private readonly BATCH_INTERVAL: number;
  private dataBuffer: Map<string, InfluxPoint[]> = new Map(); // Groupé par bucket
  private processingTimer: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor(
    private influxDBService: InfluxDBService,
    private prismaService: PrismaService,
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

    // Logger.overrideLogger(this.serviceConfigService.logLevel as any);
  }

  onModuleInit() {
    this.logger.log('Initializing MQTT service with multi-tenant bucket support');
    this.connectToMqtt();
    this.startPeriodicBufferFlush();
  }

  private startPeriodicBufferFlush() {
    // Flush buffer based on the interval from configuration
    this.logger.log(`Setting up periodic buffer flush every ${this.BATCH_INTERVAL}ms`);
    this.processingTimer = setInterval(() => {
      this.flushAllBuffers();
    }, this.BATCH_INTERVAL);
  }

  private async flushAllBuffers() {
    if (this.dataBuffer.size === 0) return;

    try {
      this.logger.log(`Flushing ${this.dataBuffer.size} bucket buffers to InfluxDB`);

      for (const [bucketName, points] of this.dataBuffer.entries()) {
        if (points.length === 0) continue;

        const batchSize = Math.min(this.BATCH_SIZE, points.length);
        const batch = points.splice(0, batchSize);

        this.logger.log(`Flushing ${batch.length} points to bucket: ${bucketName}`);

        // Process points for this specific bucket
        const results = await Promise.allSettled(
          batch.map(point =>
            this.influxDBService.writePointToBucket(
              point.measurement,
              point.tags,
              point.fields,
              bucketName
            )
          )
        );

        // Count successes and failures
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        this.logger.log(`Bucket ${bucketName} flush complete: ${successful} successful, ${failed} failed`);

        // If there were failures, log them
        if (failed > 0) {
          results.forEach((result) => {
            if (result.status === 'rejected') {
              this.logger.error(`Failed to write point to ${bucketName}: ${(result as PromiseRejectedResult).reason}`);
            }
          });
        }

        // Nettoyer les buffers vides
        if (points.length === 0) {
          this.dataBuffer.delete(bucketName);
        }
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
      rejectUnauthorized: false, // Should be true in production with proper certs
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
      if (this.isShuttingDown) return;

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
        }
      }
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
    }
  }

  private validateMessage(data: any): boolean {
    // Enhanced validation to ensure the message has required fields and correct types
    if (!data || typeof data !== 'object') return false;
    if (!data.sensorId || typeof data.sensorId !== 'string') return false;
    if (!Array.isArray(data.readings) || data.readings.length === 0) return false;
    if (!data.deviceInfo || typeof data.deviceInfo !== 'object') return false;
    if (!data.deviceInfo.id || typeof data.deviceInfo.id !== 'string') return false;

    // Validate at least one reading has correct format
    return data.readings.some(reading =>
      reading &&
      typeof reading.id === 'string' &&
      typeof reading.type === 'string' &&
      typeof reading.value === 'number' &&
      typeof reading.unit === 'string' &&
      typeof reading.timestamp === 'string' &&
      reading.location &&
      typeof reading.location.lat === 'number' &&
      typeof reading.location.lng === 'number'
    );
  }

  /**
   * Checks if a sensor reading is anomalous (has values outside expected ranges)
   */
  private isAnomalousReading(reading: SensorReading): boolean {
    // Define limits for different sensor types
    const limits: Record<string, { min: number, max: number }> = {
      temperature: { min: -40, max: 60 },
      humidity: { min: 0, max: 100 },
      airQuality: { min: 0, max: 500 },
      waterQuality: { min: 0, max: 14 },
      soilMoisture: { min: 0, max: 100 }
    };

    if (!limits[reading.type]) return false;

    return reading.value < limits[reading.type].min || reading.value > limits[reading.type].max;
  }

  private async processEnvironmentalData(data: EnvironmentalData) {
    try {
      this.logger.log(`Processing data from sensor: ${data.sensorId} (${data.readings.length} readings)`);

      // 🔄 NOUVEAU: Récupérer les informations de l'organisation du capteur
      const sensor = await this.prismaService.sensor.findUnique({
        where: { id: data.sensorId },
        include: {
          organization: {
            select: {
              influxBucketName: true,
              bucketSyncStatus: true
            }
          }
        }
      });

      if (!sensor) {
        this.logger.error(`Sensor ${data.sensorId} not found in database`);
        return;
      }

      if (!sensor.organization.influxBucketName || sensor.organization.bucketSyncStatus !== 'ACTIVE') {
        this.logger.error(`Bucket not ready for sensor ${data.sensorId} organization`);
        return;
      }

      const bucketName = sensor.organization.influxBucketName;

      // For each sensor reading, create a point
      for (const reading of data.readings) {
        // Check for anomalous readings
        const isAnomalous = this.isAnomalousReading(reading);
        if (isAnomalous) {
          this.logger.warn(`Anomalous reading detected: ${reading.type} value ${reading.value} from ${data.sensorId}`);
          // Still process the reading but tag it as anomalous
        }

        // 🔄 NOUVEAU: Créer le point avec les informations de l'organisation
        const point: InfluxPoint = {
          measurement: `sensor_${reading.type.toLowerCase()}`,
          tags: {
            sensor_id: data.sensorId,
            organization_id: sensor.organizationId,
            type: reading.type,
            unit: reading.unit,
            device_id: data.deviceInfo.id,
            model: data.deviceInfo.model || 'unknown',
            firmware: data.deviceInfo.firmware || 'unknown',
            latitude: reading.location.lat.toString(),
            longitude: reading.location.lng.toString(),
            location_name: reading.location.name || 'Unknown',
            anomalous: isAnomalous ? 'true' : 'false'
          },
          fields: {
            value: reading.value,
            battery_level: reading.batteryLevel || 0,
            timestamp: new Date(reading.timestamp).getTime(),
            // Add any additional metadata as fields
            ...(reading.metadata || {})
          }
        };

        // 🔄 NOUVEAU: Ajouter au buffer spécifique du bucket
        if (!this.dataBuffer.has(bucketName)) {
          this.dataBuffer.set(bucketName, []);
        }
        this.dataBuffer.get(bucketName)!.push(point);
      }

      // 🔄 NOUVEAU: Vérifier si le buffer pour ce bucket atteint le seuil
      const bucketBuffer = this.dataBuffer.get(bucketName);
      if (bucketBuffer && bucketBuffer.length >= this.BATCH_SIZE) {
        await this.flushBucketBuffer(bucketName);
      }

      this.logger.debug(`Added ${data.readings.length} readings to bucket ${bucketName} buffer`);
    } catch (error) {
      this.logger.error(`Error processing environmental data: ${error.message}`);
    }
  }

  /**
   * 🔄 NOUVEAU: Flush d'un buffer spécifique
   */
  private async flushBucketBuffer(bucketName: string) {
    const bucketBuffer = this.dataBuffer.get(bucketName);
    if (!bucketBuffer || bucketBuffer.length === 0) return;

    try {
      const batchSize = Math.min(this.BATCH_SIZE, bucketBuffer.length);
      const batch = bucketBuffer.splice(0, batchSize);

      this.logger.log(`Flushing ${batch.length} points to bucket: ${bucketName}`);

      // Process points for this specific bucket
      const results = await Promise.allSettled(
        batch.map(point =>
          this.influxDBService.writePointToBucket(
            point.measurement,
            point.tags,
            point.fields,
            bucketName
          )
        )
      );

      // Count successes and failures
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`Bucket ${bucketName} flush complete: ${successful} successful, ${failed} failed`);

      // If there were failures, log them
      if (failed > 0) {
        results.forEach((result) => {
          if (result.status === 'rejected') {
            this.logger.error(`Failed to write point to ${bucketName}: ${(result as PromiseRejectedResult).reason}`);
          }
        });
      }

      // Nettoyer le buffer s'il est vide
      if (bucketBuffer.length === 0) {
        this.dataBuffer.delete(bucketName);
      }
    } catch (error) {
      this.logger.error(`Error flushing bucket ${bucketName} buffer: ${error.message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      this.isShuttingDown = true;
      this.logger.log('MQTT service shutting down');

      // Clear the timer
      if (this.processingTimer) {
        clearInterval(this.processingTimer);
      }

      // Final flush of any remaining data
      if (this.dataBuffer.size > 0) {
        const totalPoints = Array.from(this.dataBuffer.values()).reduce((sum, points) => sum + points.length, 0);
        this.logger.log(`Final flush of ${totalPoints} points before shutdown`);
        await this.flushAllBuffers();
      }

      // Close MQTT connection
      if (this.client) {
        this.logger.log('Closing MQTT connection');
        return new Promise<void>((resolve) => {
          this.client.end(false, {}, () => {
            this.logger.log('MQTT connection closed');
            resolve();
          });
        });
      }
    } catch (error) {
      this.logger.error(`Error during shutdown: ${error.message}`);
    }
  }
} 