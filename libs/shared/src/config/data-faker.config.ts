import { registerAs } from '@nestjs/config';

export const dataFakerConfig = registerAs('data-faker', () => ({
    intervalMs: parseInt(process.env.DATA_FAKER_INTERVAL_MS || '5000', 10),
    sensorsCount: parseInt(process.env.DATA_FAKER_SENSORS_COUNT || '5', 10),
}));