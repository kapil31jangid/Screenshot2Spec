import assert from 'node:assert/strict';

async function runSmokeTest() {
  console.log('Testing Backend Server on http://localhost:3001...');

  // 1. Health check
  const healthRes = await fetch('http://localhost:3001/health');
  assert.equal(healthRes.status, 200, 'Health check must return 200');
  const healthJson = await healthRes.json();
  assert.equal(healthJson.status, 'ok', 'Health status must be ok');
  console.log('✔ Health check OK:', healthJson);

  // 2. Test POST /api/analyze (mock/test fallback)
  const validPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(validPngBase64, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append('screenshot', blob, 'sample.png');
  formData.append('framework', 'Next.js / React (App Router)');
  formData.append('styling', 'Tailwind CSS');
  formData.append('instructions', 'Extract layout and component hierarchy.');

  const analyzeRes = await fetch('http://localhost:3001/api/analyze?mock=true', {
    method: 'POST',
    body: formData,
  });

  assert.equal(analyzeRes.status, 200, 'Analyze endpoint with mock=true must return 200');
  const analyzeJson = await analyzeRes.json();
  assert.ok(analyzeJson.analysis, 'Response must have analysis property');
  assert.equal(analyzeJson.analysis.pageType, 'dashboard', 'Page type should match mock dashboard');
  assert.ok(Array.isArray(analyzeJson.analysis.components), 'Components must be an array');
  assert.ok(analyzeJson.analysis.components.length > 0, 'Must contain components');
  console.log('✔ Analysis endpoint OK: returned', analyzeJson.analysis.components.length, 'components');

  console.log('🎉 ALL INTEGRATION SMOKE TESTS PASSED!');
}

runSmokeTest().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});

