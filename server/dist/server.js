"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const config_js_1 = require("./config.js");
const playerRoutes_js_1 = require("./playerRoutes.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_js_1.config.corsOrigin,
}));
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/players', playerRoutes_js_1.playerRouter);
app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    res.status(500).json({ error: message });
});
app.listen(config_js_1.config.port, () => {
    console.log(`Metrics API running on http://localhost:${config_js_1.config.port}`);
});
