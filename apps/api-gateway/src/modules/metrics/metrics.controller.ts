import { Controller, Get, Param, Query } from '@nestjs/common';
import { InfluxDBService } from '@ecowatch/shared';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly influx: InfluxDBService) {}

  @Get('sensors/:sensorId/history')
  async sensorHistory(
    @Param('sensorId') sensorId: string,
    @Query('type') type = 'temperature',
    @Query('range') range = '-24h',
    @Query('orgBucket') orgBucket?: string,
    @Query('orgId') orgId?: string,
  ) {
    const measurement = `sensor_${type.toLowerCase()}`;
    const bucket = orgBucket || process.env.INFLUXDB_BUCKET!;
    const orgFilter = orgId ? `
          |> filter(fn: (r) => r.organization_id == "${orgId}")` : '';
    const flux = `
        from(bucket: "${bucket}")
          |> range(start: ${range})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r.sensor_id == "${sensorId}")${orgFilter}
          |> filter(fn: (r) => r._field == "value")
          |> keep(columns: ["_time", "_value", "unit", "type"])
          |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
          |> yield(name: "mean")
      `;
    const rows = await this.influx.query(flux);
    return rows.map((r: any) => ({ time: r._time, value: r._value, unit: r.unit, type: r.type }));
  }

  @Get('sensors/:sensorId/latest')
  async latest(
    @Param('sensorId') sensorId: string,
    @Query('type') type = 'temperature',
    @Query('orgBucket') orgBucket?: string,
    @Query('orgId') orgId?: string,
  ) {
    const measurement = `sensor_${type.toLowerCase()}`;
    const bucket = orgBucket || process.env.INFLUXDB_BUCKET!;
    const orgFilter = orgId ? `
          |> filter(fn: (r) => r.organization_id == "${orgId}")` : '';
    const flux = `
        from(bucket: "${bucket}")
          |> range(start: -30d)
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r.sensor_id == "${sensorId}")${orgFilter}
          |> filter(fn: (r) => r._field == "value")
          |> last()
          |> keep(columns: ["_time", "_value", "unit", "type"])
          |> yield(name: "last")
      `;
    const rows = await this.influx.query(flux);
    if (!rows || rows.length === 0) return null;
    const r = rows[0] as any;
    return { time: r._time, value: r._value, unit: r.unit, type: r.type };
  }
}

