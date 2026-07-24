"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const playerSessionService_js_1 = require("./playerSessionService.js");
(0, node_test_1.default)('normalizes player server data into the API shape', () => {
    const serverNameMap = new Map([['server-1', 'My Server']]);
    const result = (0, playerSessionService_js_1.normalizePlayerServerInfo)('server-1', {
        id: 'server-1',
        type: 'playerServerInformation',
        attributes: {
            firstSeen: '2024-01-01T00:00:00Z',
            lastSeen: '2024-02-01T00:00:00Z',
            timePlayed: 42,
            online: true,
        },
    }, serverNameMap);
    strict_1.default.deepEqual(result, {
        serverId: 'server-1',
        serverName: 'My Server',
        firstSeen: '2024-01-01T00:00:00Z',
        lastSeen: '2024-02-01T00:00:00Z',
        timePlayed: 42,
        online: true,
    });
});
