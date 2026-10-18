/**
 * MeshManager End-to-End Test Suite
 * Tests:
 * 1. Health & Statistics
 * 2. Models & Virtual Pin Listing
 * 3. Dynamic Task Routing (Micro vs Strategic)
 * 4. Pinned Virtual Model Targeting (e.g. acc-paid-pro/gemini-2.5-pro)
 * 5. Streaming SSE Passthrough
 * 6. Rate Limit Auto-Failover (429 Resilience)
 * 7. Hermes-Style Self-Healing Reflection Engine
 * 8. Account CRUD & Disk Persistence
 * 9. API Key Verification
 * 10. Live IDE Connections Activity Feed
 */

const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 20128,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers
        }
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data), raw: data, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data, headers: res.headers });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('\x1b[36m====================================================\x1b[0m');
  console.log('\x1b[1m 🧪 MeshManager E2E Test Suite (v2.1)\x1b[0m');
  console.log('\x1b[36m====================================================\x1b[0m\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(` • ${name.padEnd(54)}: `);
    try {
      await fn();
      console.log('\x1b[32m[PASS]\x1b[0m');
      passed++;
    } catch (err) {
      console.log(`\x1b[31m[FAIL: ${err.message}]\x1b[0m`);
      failed++;
    }
  }

  // Test 1: Health & Stats
  await test('Endpoint: GET /api/stats responds 200', async () => {
    const res = await request('GET', '/api/stats');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  // Test 2: Models listing + virtual pins
  await test('Endpoint: GET /v1/models exposes virtual pins', async () => {
    const res = await request('GET', '/v1/models');
    if (res.status !== 200 || !res.data.data) throw new Error('Invalid models payload');
    const ids = res.data.data.map(m => m.id);
    if (!ids.includes('auto-smart-router')) throw new Error('Missing auto-smart-router');
    const hasPin = ids.some(id => id.includes('/'));
    if (!hasPin) throw new Error('Missing virtual pin model IDs (accountId/modelId)');
  });

  // Test 3: Micro task dynamic allocation
  await test('Routing: Micro Syntax task -> Free Flash', async () => {
    const res = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Add docstring comments and format code syntax for this function' }],
      model: 'auto-smart-router'
    }, { 'x-client-ide': 'Antigravity IDE' });
    if (res.status !== 200) throw new Error(`Failed: HTTP ${res.status}`);
    const tier = res.headers['x-meshmanager-tier'];
    if (!tier || !tier.includes('MICRO_SYNTAX')) throw new Error(`Expected MICRO_SYNTAX, got ${tier}`);
  });

  // Test 4: Strategic task dynamic allocation
  await test('Routing: Strategic task -> Paid Pro', async () => {
    const res = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Architect and plan multi-file refactoring across multiple repositories and microservices' }],
      model: 'auto-smart-router'
    }, { 'x-client-ide': 'Cursor AI' });
    if (res.status !== 200) throw new Error(`Failed: HTTP ${res.status}`);
    const tier = res.headers['x-meshmanager-tier'];
    if (!tier || !tier.includes('STRATEGIC_REASON')) throw new Error(`Expected STRATEGIC_REASON, got ${tier}`);
  });

  // Test 5: Virtual Pin Targeting (Specific Account & Model)
  await test('Virtual Pin: Route directly to acc-paid-pro/gemini-2.5-pro', async () => {
    const res = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Write a quick python script' }],
      model: 'acc-paid-pro/gemini-2.5-pro'
    }, { 'x-client-ide': 'VS Code (Continue)' });
    if (res.status !== 200) throw new Error(`Failed: HTTP ${res.status}`);
    const accountUsed = res.headers['x-meshmanager-account'];
    const modelUsed = res.headers['x-meshmanager-model'];
    if (accountUsed !== 'acc-paid-pro' || modelUsed !== 'gemini-2.5-pro') {
      throw new Error(`Virtual pin failed. Got account=${accountUsed}, model=${modelUsed}`);
    }
  });

  // Test 6: Streaming SSE
  await test('Streaming: POST /v1/chat/completions (stream=true)', async () => {
    const res = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Explain merge sort' }],
      model: 'auto-smart-router',
      stream: true
    });
    if (res.status !== 200 || !res.raw.includes('data:') || !res.raw.includes('[DONE]')) {
      throw new Error('Stream did not emit proper SSE chunks');
    }
  });

  // Test 7: Auto-Failover on 429
  await test('Failover: 429 rate limit triggers auto-failover', async () => {
    const failoverRes = await request('POST', '/api/accounts/simulate-429', {
      accountId: 'acc-free-1'
    });
    if (failoverRes.status !== 200 || !failoverRes.data.success) {
      throw new Error('Failed to simulate 429');
    }
    const completionRes = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Format this snippet' }],
      model: 'auto-smart-router'
    });
    if (completionRes.status !== 200) throw new Error('Failover route failed');
  });

  // Test 8: Self-Healing
  await test('Self-Healing: Auto-repairs malformed JSON tool calls', async () => {
    const healRes = await request('POST', '/api/heal/simulate', {
      toolName: 'edit_file',
      malformedInput: '```json\n{"path": "C:\\projects\\app\\main.py", "lines": [1, 2, ],}\n```',
      error: 'Unexpected token in JSON'
    });
    if (healRes.status !== 200 || !healRes.data.healed) {
      throw new Error('Self-healing failed to repair payload');
    }
  });

  // Test 9: Account Management CRUD
  await test('Account CRUD: Create, update default model, delete', async () => {
    // 1. Add
    const addRes = await request('POST', '/api/accounts', {
      id: 'test-qa-acc',
      name: 'QA Test Account',
      tier: 'paid_pro',
      defaultModel: 'gemini-2.5-pro',
      apiKey: 'TEST_KEY'
    });
    if (addRes.status !== 200 || !addRes.data.success) throw new Error('Failed to create account');

    // 2. Update model
    const putRes = await request('PUT', '/api/accounts/test-qa-acc', {
      defaultModel: 'gemini-3.8-flash'
    });
    if (putRes.status !== 200 || putRes.data.account.defaultModel !== 'gemini-3.8-flash') {
      throw new Error('Failed to update account default model');
    }

    // 3. Delete
    const delRes = await request('DELETE', '/api/accounts/test-qa-acc');
    if (delRes.status !== 200 || !delRes.data.success) throw new Error('Failed to delete account');
  });

  // Test 10: API Key Verification
  await test('Key Verification: Validates keys (Mock/Live)', async () => {
    const verifyRes = await request('POST', '/api/accounts/verify', {
      apiKey: 'DEMO_MOCK_KEY'
    });
    if (verifyRes.status !== 200 || !verifyRes.data.valid) {
      throw new Error('Key verification failed');
    }
  });

  // Test 11: Live Activity Feed
  await test('Activity Feed: Tracks client IDE & models in matrix', async () => {
    const connRes = await request('GET', '/api/connections');
    if (connRes.status !== 200 || !Array.isArray(connRes.data) || connRes.data.length < 3) {
      throw new Error('Activity feed did not record requests from IDEs');
    }
    const hasClient = connRes.data.some(c => c.clientIDE.includes('Cursor') || c.clientIDE.includes('Antigravity'));
    if (!hasClient) throw new Error('Activity feed missing client IDE metadata');
  });

  console.log('\n\x1b[36m====================================================\x1b[0m');
  console.log(`\x1b[1mSummary: \x1b[32m${passed} Passed\x1b[0m, \x1b[${failed > 0 ? '31m' : '32m'}${failed} Failed\x1b[0m of ${passed + failed} Tests`);
  console.log('\x1b[36m====================================================\x1b[0m');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('\x1b[31m[!] Test Runner Error:', err.message, '\x1b[0m');
  process.exit(1);
});
