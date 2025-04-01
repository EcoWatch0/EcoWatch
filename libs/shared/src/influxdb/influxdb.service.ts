import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { influxdbConfig } from './influxdb.config';

@Injectable()
export class InfluxDBService implements OnModuleDestroy {
  private client: InfluxDB;
  private writeApi: WriteApi;

  constructor(
    @Inject(influxdbConfig.KEY)
    private config: ConfigType<typeof influxdbConfig>,
  ) {
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