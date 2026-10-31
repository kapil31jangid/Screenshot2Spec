import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { NextRequest } from 'next/server';
import { POST } from '../src/api/analyze/route';

describe('Live Gemma 4 API Integration Test', () => {
  it('successfully analyzes a representative UI screenshot via live Gemma 4', async () => {
    // Attempt reading from .env if process.env.GEMINI_API_KEY is not already set
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

    if (process.env.RUN_LIVE_TESTS !== 'true') {
      console.log('Skipping live Gemma 4 test to preserve API quota. Set RUN_LIVE_TESTS=true or run npm run test:live to execute.');
      return;
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      console.log('Skipping live Gemma 4 test: GEMINI_API_KEY is not configured.');
      return;
    }

    // 1x1 transparent PNG with valid PNG signature
    const samplePngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(samplePngBase64, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });

    const formData = new FormData();
    formData.append('screenshot', blob, 'sample.png');
    formData.append('framework', 'Next.js / React (App Router)');
    formData.append('styling', 'Tailwind CSS');
    formData.append('instructions', 'Identify layout regions and components.');

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    assert.equal(res.status, 200, `Expected 200 OK from live Gemma 4 endpoint, got ${res.status}`);
    const json = await res.json();

    assert.ok(json.analysis, 'Response must contain analysis object');
    assert.ok(json.analysis.pageType, 'Analysis must contain pageType');
    assert.ok(Array.isArray(json.analysis.components), 'Components must be an array');
    assert.ok(json.analysis.components.length > 0, 'Should have at least 1 component');
    console.log(`[LIVE INTEGRATION VERIFIED] Gemma 4 returned pageType: "${json.analysis.pageType}", detected ${json.analysis.components.length} components.`);
  });
});
