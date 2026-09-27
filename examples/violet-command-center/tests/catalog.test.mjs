import test from 'node:test';
import assert from 'node:assert/strict';
import { innovations, categories } from '../src/catalog.js';

test('the installed innovation registry contains 77 uniquely identified entries', () => {
  assert.equal(innovations.length, 77);
  assert.equal(new Set(innovations.map((item) => item.id)).size, 77);
  assert.ok(innovations.every((item) => item.title && item.description && item.status === 'Installed in local frontend'));
});

test('all seven department groups are represented with no orphaned entries', () => {
  assert.equal(categories.length, 7);
  assert.deepEqual(new Set(innovations.map((item) => item.category)), new Set(categories.map((item) => item.id)));
});
