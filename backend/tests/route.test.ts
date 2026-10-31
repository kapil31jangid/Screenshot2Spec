import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST, verifyImageMagicBytes } from '../src/api/analyze/route';

// Minimal valid PNG buffer with valid 8-byte PNG signature
const VALID_PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

// Minimal valid JPEG buffer
const VALID_JPEG_BUFFER = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
]);

// Minimal valid WebP buffer
const VALID_WEBP_BUFFER = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
  0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
]);

describe('POST /api/analyze Route Handler', () => {
  describe('File Signature & Magic Byte Verification', () => {
    it('correctly verifies PNG magic bytes', () => {
      assert.equal(verifyImageMagicBytes(VALID_PNG_BUFFER), 'image/png');
    });

    it('correctly verifies JPEG magic bytes', () => {
      assert.equal(verifyImageMagicBytes(VALID_JPEG_BUFFER), 'image/jpeg');
    });

    it('correctly verifies WebP magic bytes', () => {
      assert.equal(verifyImageMagicBytes(VALID_WEBP_BUFFER), 'image/webp');
    });

    it('rejects buffers with invalid signatures', () => {
      const invalidBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]);
      assert.equal(verifyImageMagicBytes(invalidBuffer), null);
    });
  });

  describe('Request & Upload Validation', () => {
    it('returns 400 when request is not multipart/form-data', async () => {
      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ framework: 'Next.js' }),
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

    it('returns 400 when screenshot file is empty (0 bytes)', async () => {
      const formData = new FormData();
      const emptyBlob = new Blob([], { type: 'image/png' });
      formData.append('screenshot', emptyBlob, 'empty.png');

      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.ok(json.error.includes('empty (0 bytes)'));
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

    it('returns 415 when uploaded file header does not match valid image signature', async () => {
      const formData = new FormData();
      // Has image/png MIME type but content is corrupted text
      const spoofedBlob = new Blob(['NOT_A_REAL_PNG_HEADER_DATA_1234'], { type: 'image/png' });
      formData.append('screenshot', spoofedBlob, 'fake.png');

      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      assert.equal(res.status, 415);
      const json = await res.json();
      assert.ok(json.error.includes('signature'));
    });

    it('returns 413 when uploaded image exceeds 5 MB limit', async () => {
      const formData = new FormData();
      // 5.2 MB payload with valid PNG header
      const largeBuffer = Buffer.alloc(5.2 * 1024 * 1024);
      VALID_PNG_BUFFER.copy(largeBuffer);
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

    it('returns 400 when framework is unsupported in MVP', async () => {
      const formData = new FormData();
      const validBlob = new Blob([VALID_PNG_BUFFER], { type: 'image/png' });
      formData.append('screenshot', validBlob, 'test.png');
      formData.append('framework', 'Vue 3 with Pinia');

      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.ok(json.error.includes('Unsupported target framework'));
    });

    it('returns 400 when styling system is unsupported in MVP', async () => {
      const formData = new FormData();
      const validBlob = new Blob([VALID_PNG_BUFFER], { type: 'image/png' });
      formData.append('screenshot', validBlob, 'test.png');
      formData.append('styling', 'Bootstrap 5');

      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.ok(json.error.includes('Unsupported styling system'));
    });

    it('returns 400 when instructions exceed 2,000 characters', async () => {
      const formData = new FormData();
      const validBlob = new Blob([VALID_PNG_BUFFER], { type: 'image/png' });
      formData.append('screenshot', validBlob, 'test.png');
      formData.append('instructions', 'x'.repeat(2001));

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
      const validBlob = new Blob([VALID_PNG_BUFFER], { type: 'image/png' });
      formData.append('screenshot', validBlob, 'test.png');
      formData.append('framework', 'Next.js / React (App Router)');
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
  });
});
