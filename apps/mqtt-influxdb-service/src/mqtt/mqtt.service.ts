import { Injectable, OnModuleDestroy, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { InfluxDBService } from '@ecowatch/shared/src/service/influxdb/influxdb.service';
import { PrismaService } from '@ecowatch/shared/src/service/prisma/prisma.service';
import { mqttConfig, serviceConfig } from '../config';
import { SensorReading, EnvironmentalData, InfluxPoint } from '@ecowatch/shared/src/interactors/sensors/interfaces/sensor.interface';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);
  private connected = false;
  private connectionRetries = 0;
  private readonly MAX_RETRIES: number;
  private readonly BATCH_SIZE: number;
  private readonly BATCH_INTERVAL: number;
  private dataBuffer: Map<string, InfluxPoint[]> = new Map();
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
    this.MAX_RETRIES = this.serviceConfigService.maxRetries;
    this.BATCH_SIZE = this.serviceConfigService.batchSize;
    this.BATCH_INTERVAL = this.serviceConfigService.batchInterval;
  }

  onModuleInit() {
    this.logger.log('Initializing MQTT service with multi-tenant bucket support');
    this.connectToMqtt();
    this.startProcessingTimer();
  }

  /**
   * Start the processing timer to flush buffers periodically
   */
  private startProcessingTimer() {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
    }

    this.processingTimer = setInterval(async () => {
      if (this.dataBuffer.size > 0) {
        this.logger.debug('Timer-triggered buffer flush');
        await this.flushAllBuffers();
      }
    }, this.BATCH_INTERVAL);

    this.logger.log(`Processing timer started with interval: ${this.BATCH_INTERVAL}ms`);
  }

  /**
   * Flush all buffers to InfluxDB
   * @returns void
   */
  private async flushAllBuffers() {
    try {
      const totalPoints = Array.from(this.dataBuffer.values()).reduce((sum, points) => sum + points.length, 0);
      this.logger.log(`Flushing ${totalPoints} points to InfluxDB`);

      for (const [bucketName, points] of this.dataBuffer.entries()) {
        if (points.length === 0) continue;

        await this.flushBucketBuffer(bucketName);
        this.dataBuffer.delete(bucketName);
        this.logger.log(`Bucket ${bucketName} flushed`);

      }
    } catch (error) {
      this.logger.error(`Error flushing buffer: ${error.message}`);
    }
  }

  /**
   * Connect to the MQTT broker
   * @returns void
   */
  private connectToMqtt() {
    this.logger.log(`Connecting to MQTT broker at ${this.mqttConfigService.brokerUrl}`);

    const options: mqtt.IClientOptions = {
      clientId: `${this.mqttConfigService.clientId}-${Date.now()}`,
      clean: true,
      reconnectPeriod: this.mqttConfigService.reconnectPeriod,
      rejectUnauthorized: false,
      keepalive: 60,
    };

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

      if (this.connectionRetries > this.MAX_RETRIES) {
        this.logger.error(`Max reconnection attempts (${this.MAX_RETRIES}) reached. Stopping reconnection attempts.`);
        this.client.end(true);
      }
    });

    this.client.on('message', this.handleMessage.bind(this));
  }

  /**
   * Subscribe to topics
   * @returns void
   */
  private subscribeToTopics() {
    const topics = Array.isArray(this.mqttConfigService.topic)
      ? this.mqttConfigService.topic
      : [this.mqttConfigService.topic];

    topics.forEach(topic => {
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

  /**
   * Handle a message from the MQTT broker
   * @param topic - The topic of the message
   * @param message - The message
   * @returns void
   */
  private async handleMessage(topic: string, message: Buffer) {
    try {
      this.logger.debug(`Received message on topic: ${topic}`);

      if (topic.includes('ecowatch/sensors') && topic.includes('/data')) {
        try {
          const messageStr = message.toString();
          const data = JSON.parse(messageStr) as EnvironmentalData;

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

  /**
   * Validate a message
   * @param data - The message data
   * @returns boolean
   */
  private validateMessage(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (!data.sensorId || typeof data.sensorId !== 'string') return false;
    if (!Array.isArray(data.readings) || data.readings.length === 0) return false;
    if (!data.deviceInfo || typeof data.deviceInfo !== 'object') return false;
    if (!data.deviceInfo.id || typeof data.deviceInfo.id !== 'string') return false;

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
   * @param reading - The sensor reading
   * @returns boolean
   */
  private isAnomalousReading(reading: SensorReading): boolean {
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

  /**
   * Process environmental data
   * @param data - The environmental data
   * @returns void
   */
  private async processEnvironmentalData(data: EnvironmentalData) {
    try {
      this.logger.log(`Processing data from sensor: ${data.sensorId} (${data.readings.length} readings)`);

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

      for (const reading of data.readings) {
        const isAnomalous = this.isAnomalousReading(reading);
        if (isAnomalous) {
          this.logger.warn(`Anomalous reading detected: ${reading.type} value ${reading.value} from ${data.sensorId}`);
        }

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
            ...(reading.metadata || {})
          }
        };

        if (!this.dataBuffer.has(bucketName)) {
          this.dataBuffer.set(bucketName, []);
        }
        this.dataBuffer.get(bucketName)!.push(point);
      }

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
   * Flush a specific buffer
   * @param bucketName - The name of the bucket to flush
   * @returns void
   */
  private async flushBucketBuffer(bucketName: string) {
    const bucketBuffer = this.dataBuffer.get(bucketName);
    if (!bucketBuffer || bucketBuffer.length === 0) return;

    try {
      const batchSize = Math.min(this.BATCH_SIZE, bucketBuffer.length);
      const batch = bucketBuffer.splice(0, batchSize);

      this.logger.log(`Flushing ${batch.length} points to bucket: ${bucketName}`);

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

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`Bucket ${bucketName} flush complete: ${successful} successful, ${failed} failed`);

      if (failed > 0) {
        results.forEach((result) => {
          if (result.status === 'rejected') {
            this.logger.error(`Failed to write point to ${bucketName}: ${(result as PromiseRejectedResult).reason}`);
          }
        });
      }

      if (bucketBuffer.length === 0) {
        this.dataBuffer.delete(bucketName);
      }
    } catch (error) {
      this.logger.error(`Error flushing bucket ${bucketName} buffer: ${error.message}`);
    }
  }

  /**
   * Shutdown the MQTT service
   * @returns void
   */
  async onModuleDestroy(): Promise<void> {
    try {
      this.isShuttingDown = true;
      this.logger.log('MQTT service shutting down');

      if (this.processingTimer) {
        clearInterval(this.processingTimer);
      }

      if (this.dataBuffer.size > 0) {
        const totalPoints = Array.from(this.dataBuffer.values()).reduce((sum, points) => sum + points.length, 0);
        this.logger.log(`Final flush of ${totalPoints} points before shutdown`);
        await this.flushAllBuffers();
      }

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