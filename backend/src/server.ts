import http from 'http';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { POST } from './api/analyze/route';

// Automatically load .env file into process.env if not already populated
function loadEnv() {
  const envCandidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
  ];
  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        const fileContent = fs.readFileSync(envPath, 'utf8');
        for (const line of fileContent.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=');
            if (idx !== -1) {
              const key = trimmed.slice(0, idx).trim();
              const val = trimmed.slice(idx + 1).trim();
              if (!process.env[key]) {
                process.env[key] = val;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[Backend Server] Could not read ${envPath}:`, err);
      }
    }
  }
}
loadEnv();

const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3001);

/**
 * Converts a standard Node.js IncomingMessage into a Web Standard NextRequest
 */
async function toNextRequest(req: http.IncomingMessage, fullUrl: string): Promise<NextRequest> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const bodyBuffer = Buffer.concat(chunks);

  const headers = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (val !== undefined) {
      if (Array.isArray(val)) {
        for (const v of val) headers.append(key, v);
      } else {
        headers.set(key, val);
      }
    }
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD' && bodyBuffer.length > 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextRequest(fullUrl, {
    method: req.method,
    headers,
    body: hasBody ? bodyBuffer : undefined,
    duplex: 'half',
  } as any);
}

const server = http.createServer(async (req, res) => {
  // Add CORS headers for frontend integration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || `localhost:${PORT}`;
  const fullUrl = `${protocol}://${host}${req.url}`;
  const urlObj = new URL(fullUrl);

  if (urlObj.pathname === '/health' || urlObj.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'screenshot2spec-backend', port: PORT }));
    return;
  }

  if (urlObj.pathname === '/api/analyze' && req.method === 'POST') {
    try {
      const nextReq = await toNextRequest(req, fullUrl);
      const nextRes = await POST(nextReq);

      res.writeHead(nextRes.status, Object.fromEntries(nextRes.headers.entries()));
      const responseText = await nextRes.text();
      res.end(responseText);
    } catch (err: unknown) {
      console.error('[Backend Server Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal backend server error', details: String(err) }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: `Route not found: ${req.method} ${urlObj.pathname}` }));
});

server.listen(PORT, () => {
  console.log(`[Screenshot2Spec Backend] Standalone server listening on http://localhost:${PORT}`);
  console.log(`[Screenshot2Spec Backend] Health check: http://localhost:${PORT}/health`);
  console.log(`[Screenshot2Spec Backend] Endpoint: POST http://localhost:${PORT}/api/analyze`);
});

export { server };
