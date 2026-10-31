import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/analyze/route';

describe('POST /api/analyze Route Handler', () => {
  it('returns 400 when request is not multipart/form-data', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ hello: 'world' }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes('multipart/form-data'));
  });

  it('returns 400 when screenshot file is missing from form data', async () => {
    const formData = new FormData();
    formData.append('framework', 'Next.js');
    formData.append('styling', 'Tailwind CSS');

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes('Screenshot file is required'));
  });

  it('returns 415 when uploaded image has unsupported MIME type (e.g. image/gif)', async () => {
    const formData = new FormData();
    const fakeGif = new Blob(['GIF89a...'], { type: 'image/gif' });
    formData.append('screenshot', fakeGif, 'test.gif');

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    assert.equal(res.status, 415);
    const json = await res.json();
    assert.ok(json.error.includes('Unsupported image format'));
  });

  it('returns 413 when uploaded image exceeds 5 MB limit', async () => {
    const formData = new FormData();
    // 5.5 MB payload
    const largeBuffer = new Uint8Array(5.5 * 1024 * 1024);
    const largeBlob = new Blob([largeBuffer], { type: 'image/png' });
    formData.append('screenshot', largeBlob, 'large.png');

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    assert.equal(res.status, 413);
    const json = await res.json();
    assert.ok(json.error.includes('exceeds the 5 MB file size limit'));
  });

  it('returns 400 when instructions exceed 2,000 characters', async () => {
    const formData = new FormData();
    const validPng = new Blob(['PNG_DATA'], { type: 'image/png' });
    formData.append('screenshot', validPng, 'test.png');
    formData.append('instructions', 'a'.repeat(2001));

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes('2,000 characters'));
  });

  it('returns 200 with validated analysis in mock/test mode', async () => {
    const formData = new FormData();
    const validPng = new Blob(['PNG_DATA'], { type: 'image/png' });
    formData.append('screenshot', validPng, 'test.png');
    formData.append('framework', 'Next.js / React');
    formData.append('styling', 'Tailwind CSS');

    const req = new NextRequest('http://localhost:3000/api/analyze?mock=true', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.analysis);
    assert.equal(json.analysis.pageType, 'dashboard');
    assert.ok(Array.isArray(json.analysis.components));
    assert.ok(json.analysis.components.length > 0);
  });

  it('successfully invokes live Gemma 4 endpoint when GEMINI_API_KEY is configured', async () => {
    // Read from .env if present
    const fs = await import('fs');
    if (!process.env.GEMINI_API_KEY && fs.existsSync('.env')) {
      const dotenv = fs.readFileSync('.env', 'utf-8');
      for (const line of dotenv.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
        }
      }
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      console.log('Skipping live Gemma 4 test: GEMINI_API_KEY is not set');
      return;
    }

    const samplePngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(samplePngBase64, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });

    const formData = new FormData();
    formData.append('screenshot', blob, 'sample.png');
    formData.append('framework', 'Next.js / React');
    formData.append('styling', 'Tailwind CSS');

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.analysis);
    assert.ok(json.analysis.components.length > 0);
    console.log(`Live Gemma 4 test succeeded: detected pageType="${json.analysis.pageType}", ${json.analysis.components.length} components`);
  });
});

