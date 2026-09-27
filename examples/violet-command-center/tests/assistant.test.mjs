import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLocalReply } from '../src/assistant-core.js';

test('local assistant reports catalog size without implying a remote AI connection', () => {
  const answer = generateLocalReply('Show innovation status');
  assert.match(answer.text, /77 front-end capabilities across 7 departments/);
  assert.match(answer.text, /remote providers or a hosted AI model are connected/);
  assert.equal(answer.source, 'Installed innovation registry');
});

test('local assistant uses provided task, asset, and health evidence', () => {
  assert.match(generateLocalReply('What needs attention?', { openTaskCount: 2 }).text, /2 local tasks are open/);
  assert.match(generateLocalReply('List my files', { assetCount: 3 }).text, /3 active files/);
  assert.match(generateLocalReply('Summarize system health', { healthReady: true }).text, /is responding/);
});
