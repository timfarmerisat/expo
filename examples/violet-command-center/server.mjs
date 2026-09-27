import { createServer as createHttpServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};
const SECURITY_HEADERS = {
  'content-security-policy': "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; font-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self'; media-src 'self' blob:",
  'cross-origin-resource-policy': 'same-origin',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), geolocation=()',
};

export function createServer() {
  return createHttpServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch {
      response.writeHead(400, { ...SECURITY_HEADERS, 'content-type': 'text/plain; charset=utf-8' });
      response.end('Invalid path encoding');
      return;
    }

    if (request.method === 'GET' && pathname === '/api/health') {
      const payload = {
        ok: true,
        mode: 'local-demo',
        runtime: 'violet-command-center',
        checkedAt: new Date().toISOString(),
        externalProviders: 'not-connected',
        modelGateway: 'not-configured',
        dataPolicy: 'browser-local; no provider credentials are stored here',
      };
      response.writeHead(200, {
        ...SECURITY_HEADERS,
        'cache-control': 'no-store',
        'content-type': MIME['.json'],
      });
      response.end(JSON.stringify(payload));
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { ...SECURITY_HEADERS, allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' });
      response.end('Method not allowed');
      return;
    }

    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const target = resolve(ROOT, relative);
    if (target !== ROOT && !target.startsWith(`${ROOT}${sep}`)) {
      response.writeHead(403, { ...SECURITY_HEADERS, 'content-type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }

    try {
      const info = await stat(target);
      if (!info.isFile()) throw new Error('Not a file');
      const contents = await readFile(target);
      response.writeHead(200, {
        ...SECURITY_HEADERS,
        'cache-control': target.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600',
        'content-length': contents.byteLength,
        'content-type': MIME[extname(target)] ?? 'application/octet-stream',
      });
      response.end(request.method === 'HEAD' ? undefined : contents);
    } catch {
      response.writeHead(404, { ...SECURITY_HEADERS, 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? process.argv[2] ?? 4173);
  const host = process.env.HOST ?? '127.0.0.1';
  const server = createServer();
  server.listen(port, host, () => {
    console.log(`Violet Command Center ready at http://${host}:${port}`);
    console.log('Local demo mode: external providers and model gateway are not connected.');
  });
}
