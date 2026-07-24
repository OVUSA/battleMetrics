"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const config_js_1 = require("./config.js");
(0, node_test_1.default)('allows Vercel preview origins', () => {
    strict_1.default.equal((0, config_js_1.isAllowedOrigin)('https://battle-metrics-1wg75uk72-battle-metrics-s-projects.vercel.app'), true);
});
(0, node_test_1.default)('allows localhost origins', () => {
    strict_1.default.equal((0, config_js_1.isAllowedOrigin)('http://localhost:5173'), true);
});
(0, node_test_1.default)('rejects unrelated origins', () => {
    strict_1.default.equal((0, config_js_1.isAllowedOrigin)('https://evil.example.com'), false);
});
