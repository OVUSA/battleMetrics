import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizePlayerServerInfo } from './playerSessionService.js';

test('normalizes player server data into the API shape', () => {
  const serverNameMap = new Map<string, string>([['server-1', 'My Server']]);

  const result = normalizePlayerServerInfo(
    'server-1',
    {
      id: 'server-1',
      type: 'playerServerInformation',
      attributes: {
        firstSeen: '2024-01-01T00:00:00Z',
        lastSeen: '2024-02-01T00:00:00Z',
        timePlayed: 42,
        online: true,
      },
    },
    serverNameMap,
  );

  assert.deepEqual(result, {
    serverId: 'server-1',
    serverName: 'My Server',
    firstSeen: '2024-01-01T00:00:00Z',
    lastSeen: '2024-02-01T00:00:00Z',
    timePlayed: 42,
    online: true,
  });
});
