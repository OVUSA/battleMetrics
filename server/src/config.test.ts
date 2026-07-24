import test from 'node:test';
import assert from 'node:assert/strict';

import { isAllowedOrigin } from './config.js';

test('allows Vercel preview origins', () => {
  assert.equal(
    isAllowedOrigin('https://battle-metrics-1wg75uk72-battle-metrics-s-projects.vercel.app'),
    true,
  );
});

test('allows localhost origins', () => {
  assert.equal(isAllowedOrigin('http://localhost:5173'), true);
});

test('rejects unrelated origins', () => {
  assert.equal(isAllowedOrigin('https://evil.example.com'), false);
});
