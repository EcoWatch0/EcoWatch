import { Injectable, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { influxdbConfig } from '../../config/influxdb.config';

@Injectable()
export class InfluxDBService implements OnModuleDestroy {
  private client: InfluxDB;
  private writeApi: WriteApi;
  private readonly logger = new Logger(InfluxDBService.name);

  constructor(
    @Inject(influxdbConfig.KEY)
    private config: ConfigType<typeof influxdbConfig>,
  ) {
    const maskedToken = this.config.token
      ? `${this.config.token.substring(0, 5)}...${this.config.token.length > 10 ? this.config.token.substring(this.config.token.length - 5) : ''}`
      : 'NOT SET';

    this.logger.log(`InfluxDB configuration: URL=${this.config.url}, Token=${maskedToken}, Org=${this.config.org}, Bucket=${this.config.bucket}`);

    if (!this.config.token) {
      this.logger.error('InfluxDB token is missing or empty!');
    }

    this.client = new InfluxDB({ url: this.config.url, token: this.config.token });
    this.writeApi = this.client.getWriteApi(this.config.org, this.config.bucket);
  }

  /**
   * Write a point to a specific bucket
   * @param measurement - The measurement of the point
   * @param tags - The tags of the point
   * @param fields - The fields of the point
   * @param bucketName - The name of the bucket to write to
   */
  async writePointToBucket(
    measurement: string,
    tags: Record<string, string>,
    fields: Record<string, any>,
    bucketName: string
  ) {
    const point = new Point(measurement);

    Object.entries(tags).forEach(([key, value]) => {
      point.tag(key, value);
    });

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
      const bucketWriteApi = this.client.getWriteApi(this.config.orgId, bucketName);
      await bucketWriteApi.writePoint(point);
      await bucketWriteApi.flush();
      await bucketWriteApi.close();
    } catch (error) {
      throw new Error(`Failed to write to InfluxDB bucket ${bucketName}: ${error.message}`);
    }
  }

  async query(fluxQuery: string) {
    const orgForQuery = this.config.orgId || this.config.org;
    const queryApi = this.client.getQueryApi(orgForQuery);
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