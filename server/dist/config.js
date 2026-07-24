"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.isAllowedOrigin = exports.getAllowedOrigins = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://battle-metrics.vercel.app'];
const getAllowedOrigins = () => {
    const origins = [...defaultOrigins];
    const corsOriginEnv = process.env.CORS_ORIGIN;
    if (corsOriginEnv) {
        origins.push(...corsOriginEnv.split(',').map((origin) => origin.trim()).filter(Boolean));
    }
    return [...new Set(origins.filter(Boolean))];
};
exports.getAllowedOrigins = getAllowedOrigins;
const isAllowedOrigin = (origin) => {
    if (!origin) {
        return true;
    }
    const normalizedOrigin = origin.trim().toLowerCase();
    const allowedOrigins = (0, exports.getAllowedOrigins)().map((allowedOrigin) => allowedOrigin.trim().toLowerCase());
    if (allowedOrigins.includes(normalizedOrigin)) {
        return true;
    }
    return /^(https?:\/\/localhost(:\d+)?|https:\/\/[^\s/]+\.vercel\.app|https:\/\/[^\s/]+\.onrender\.com)$/i.test(normalizedOrigin);
};
exports.isAllowedOrigin = isAllowedOrigin;
exports.config = {
    port: Number(process.env.PORT ?? 3001),
    corsOrigin: (0, exports.getAllowedOrigins)(),
    battleMetricsBaseUrl: process.env.BATTLEMETRICS_BASE_URL ?? 'https://api.battlemetrics.com',
    battleMetricsApiToken: process.env.BATTLEMETRICS_API_TOKEN ?? '',
};
