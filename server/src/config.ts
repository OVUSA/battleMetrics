import dotenv from 'dotenv';

dotenv.config();

const getAllowedOrigins = (): string[] => {
  const origins = ['http://localhost:5173', 'http://localhost:3000', 'https://battle-metrics.vercel.app'];
  const corsOriginEnv = process.env.CORS_ORIGIN;
  if (corsOriginEnv) {
    origins.push(...corsOriginEnv.split(',').map(o => o.trim()));
  }
  return origins;
};

export const config = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: getAllowedOrigins(),
  battleMetricsBaseUrl: process.env.BATTLEMETRICS_BASE_URL ?? 'https://api.battlemetrics.com',
  battleMetricsApiToken: process.env.BATTLEMETRICS_API_TOKEN ?? '',
};
