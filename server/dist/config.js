"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: Number(process.env.PORT ?? 3001),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    battleMetricsBaseUrl: process.env.BATTLEMETRICS_BASE_URL ?? 'https://api.battlemetrics.com',
    battleMetricsApiToken: process.env.BATTLEMETRICS_API_TOKEN ?? '',
};
