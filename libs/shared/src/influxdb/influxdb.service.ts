import { Injectable, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { influxdbConfig } from './config/influxdb.config';

@Injectable()
export class InfluxDBService implements OnModuleDestroy {
  private client: InfluxDB;
  private writeApi: WriteApi;
  private readonly logger = new Logger(InfluxDBService.name);

  constructor(
    @Inject(influxdbConfig.KEY)
    private config: ConfigType<typeof influxdbConfig>,
  ) {
    // Log configuration for debugging (masking the token partially)
    const maskedToken = this.config.token
      ? `${this.config.token.substring(0, 5)}...${this.config.token.length > 10 ? this.config.token.substring(this.config.token.length - 5) : ''}`
      : 'NOT SET';

    this.logger.log(`InfluxDB configuration: URL=${this.config.url}, Token=${maskedToken}, Org=${this.config.org}, Bucket=${this.config.bucket}`);

    if (!this.config.token) {
      this.logger.error('InfluxDB token is missing or empty!');
    }

    this.client = new InfluxDB({ url: config.url, token: config.token });
    this.writeApi = this.client.getWriteApi(config.org, config.bucket);
  }

  async writePoint(measurement: string, tags: Record<string, string>, fields: Record<string, any>) {
    const point = new Point(measurement);

    // Ajout des tags
    Object.entries(tags).forEach(([key, value]) => {
      point.tag(key, value);
    });

    // Ajout des champs
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'number') {
        point.floatField(key, value);
      } else if (typeof value === 'boolean') {
        point.booleanField(key, value);
      } else {
        point.stringField(key, String(value));
      }
    });

    try {
      await this.writeApi.writePoint(point);
      await this.writeApi.flush();
    } catch (error) {
      throw new Error(`Failed to write to InfluxDB: ${error.message}`);
    }
  }

  /**
   * 🔄 NOUVEAU: Écrit un point dans un bucket spécifique
   */
  async writePointToBucket(
    measurement: string,
    tags: Record<string, string>,
    fields: Record<string, any>,
    bucketName: string
  ) {
    const point = new Point(measurement);

    // Ajout des tags
    Object.entries(tags).forEach(([key, value]) => {
      point.tag(key, value);
    });

    // Ajout des champs
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'number') {
        point.floatField(key, value);
      } else if (typeof value === 'boolean') {
        point.booleanField(key, value);
      } else {
        point.stringField(key, String(value));
      }
    });

    try {
      // Créer un writeApi spécifique pour ce bucket
      const bucketWriteApi = this.client.getWriteApi(this.config.org, bucketName);
      await bucketWriteApi.writePoint(point);
      await bucketWriteApi.flush();
      await bucketWriteApi.close();
    } catch (error) {
      throw new Error(`Failed to write to InfluxDB bucket ${bucketName}: ${error.message}`);
    }
  }

  async query(fluxQuery: string) {
    const queryApi = this.client.getQueryApi(this.config.org);
    try {
      return await queryApi.collectRows(fluxQuery);
    } catch (error) {
      throw new Error(`Failed to query InfluxDB: ${error.message}`);
    }
  }

  onModuleDestroy() {
    return this.writeApi.close();
  }
} 