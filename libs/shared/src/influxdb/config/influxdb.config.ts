import { registerAs } from '@nestjs/config';

export const influxdbConfig = registerAs('influxdb', () => ({
  url: process.env.INFLUXDB_URL || 'http://localhost:8086',
  token: process.env.INFLUXDB_TOKEN || '',
  org: process.env.INFLUXDB_ORG || '',
  bucket: process.env.INFLUXDB_BUCKET || '',
})); 