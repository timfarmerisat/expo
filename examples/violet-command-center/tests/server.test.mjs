import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';

test('local server serves the app and reports honest demo-mode health', async (context) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const page = await fetch(origin);
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('x-frame-options'), 'DENY');
  assert.match(page.headers.get('content-security-policy'), /default-src 'none'/);
  assert.match(await page.text(), /Violet Intelligence Command Center/);

  for (const [path, contentType] of [['/src/app.js', 'text/javascript'], ['/src/styles.css', 'text/css'], ['/app.webmanifest', 'application/manifest+json'], ['/sw.js', 'text/javascript']]) {
    const asset = await fetch(`${origin}${path}`);
    assert.equal(asset.status, 200, `${path} should be served`);
    assert.ok(asset.headers.get('content-type').startsWith(contentType));
  }

  const health = await fetch(`${origin}/api/health`);
  assert.equal(health.status, 200);
  const payload = await health.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.mode, 'local-demo');
  assert.equal(payload.externalProviders, 'not-connected');
  assert.equal(payload.modelGateway, 'not-configured');

  const denied = await fetch(`${origin}/api/health`, { method: 'POST' });
  assert.equal(denied.status, 405);

  const missing = await fetch(`${origin}/not-a-real-module.js`);
  assert.equal(missing.status, 404);
});
