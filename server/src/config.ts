import dotenv from 'dotenv';

dotenv.config();

const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://battle-metrics.vercel.app'];

export const getAllowedOrigins = (): string[] => {
  const origins = [...defaultOrigins];
  const corsOriginEnv = process.env.CORS_ORIGIN;
  if (corsOriginEnv) {
    origins.push(...corsOriginEnv.split(',').map((origin) => origin.trim()).filter(Boolean));
  }
  return [...new Set(origins.filter(Boolean))];
};

export const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.trim().toLowerCase();
  const allowedOrigins = getAllowedOrigins().map((allowedOrigin) => allowedOrigin.trim().toLowerCase());

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  return /^(https?:\/\/localhost(:\d+)?|https:\/\/[^\s/]+\.vercel\.app|https:\/\/[^\s/]+\.onrender\.com)$/i.test(normalizedOrigin);
};

export const config = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: getAllowedOrigins(),
  battleMetricsBaseUrl: process.env.BATTLEMETRICS_BASE_URL ?? 'https://api.battlemetrics.com',
  battleMetricsApiToken: process.env.BATTLEMETRICS_API_TOKEN ?? '',
};
