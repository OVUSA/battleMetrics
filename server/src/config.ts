import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  battleMetricsBaseUrl: process.env.BATTLEMETRICS_BASE_URL ?? 'https://api.battlemetrics.com',
  battleMetricsApiToken: process.env.BATTLEMETRICS_API_TOKEN ?? '',
};
