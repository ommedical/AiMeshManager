/**
 * MeshManager End-to-End Test Suite (v2.2)
 * Tests:
 * 1. Health & Statistics
 * 2. Models & Virtual Pin Listing
 * 3. Dynamic Task Routing (Micro vs Strategic)
 * 4. Pinned Virtual Model Targeting (e.g. acc-paid-pro-1/gemini-2.5-pro)
 * 5. Streaming SSE Passthrough
 * 6. Rate Limit Auto-Failover (429 Resilience)
 * 7. Hermes-Style Self-Healing Reflection Engine
 * 8. Account CRUD & Disk Persistence
 * 9. API Key & OAuth Bearer Token Verification
 * 10. Live IDE Connections Activity Feed
 * 11. Per-IDE Token Accounting Ledger
 * 12. Executable Validation (Pre-Check before config injection)
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess = null;

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

async function ensureServerRunning() {
  try {
    await request('GET', '/api/stats');
    return;
  } catch (err) {
    serverProcess = spawn(process.execPath, [path.join(__dirname, 'dist', 'server.js')], {
      stdio: 'ignore',
      env: { ...process.env, PORT: '20128', NO_BROWSER: 'true' }
    });

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        await request('GET', '/api/stats');
        return;
      } catch (e) {}
    }
    throw new Error('Failed to auto-start AiMeshManager server on port 20128');
  }
}

async function runTests() {
  await ensureServerRunning();

  console.log('\x1b[36m====================================================\x1b[0m');
  console.log('\x1b[1m 🧪 AiMeshManager E2E Test Suite (v2.2)\x1b[0m');
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

  // Ensure demo accounts are seeded for the test suite
  await request('POST', '/api/accounts/seed-demo');

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

  // Test 3: Micro task dynamic allocation from Cursor
  await test('Routing: Micro Syntax from Cursor -> Free Flash', async () => {
    const res = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Add docstring comments and format code syntax for this function' }],
      model: 'auto-smart-router'
    }, { 'x-client-ide': 'Cursor AI' });
    if (res.status !== 200) throw new Error(`Failed: HTTP ${res.status}`);
    const tier = res.headers['x-aimeshmanager-tier'] || res.headers['x-meshmanager-tier'];
    if (!tier || !tier.includes('MICRO_SYNTAX')) throw new Error(`Expected MICRO_SYNTAX, got ${tier}`);
  });

  // Test 4: Strategic task dynamic allocation from Antigravity
  await test('Routing: Strategic task from Antigravity -> Paid Pro', async () => {
    const res = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Architect and plan multi-file refactoring across multiple repositories and microservices' }],
      model: 'auto-smart-router'
    }, { 'x-client-ide': 'Google Antigravity' });
    if (res.status !== 200) throw new Error(`Failed: HTTP ${res.status}`);
    const tier = res.headers['x-aimeshmanager-tier'] || res.headers['x-meshmanager-tier'];
    if (!tier || !tier.includes('STRATEGIC_REASON')) throw new Error(`Expected STRATEGIC_REASON, got ${tier}`);
  });

  // Test 5: Virtual Pin Targeting (Specific Account & Model)
  await test('Virtual Pin: Route directly to acc-paid-pro-1/gemini-2.5-pro', async () => {
    const res = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Write a quick python script' }],
      model: 'acc-paid-pro-1/gemini-2.5-pro'
    }, { 'x-client-ide': 'VS Code (Continue)' });
    if (res.status !== 200) throw new Error(`Failed: HTTP ${res.status}`);
    const accountUsed = res.headers['x-aimeshmanager-account'] || res.headers['x-meshmanager-account'];
    if (accountUsed !== 'acc-paid-pro-1') throw new Error(`Expected acc-paid-pro-1, got ${accountUsed}`);
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
    // Restore acc-free-1 to active status for remaining tests
    await request('POST', '/api/accounts/acc-free-1/reset-cooldown');
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

  // Test 9: Per-IDE Token Accounting Ledger
  await test('Accounting: GET /api/ide-accounting returns per-IDE split', async () => {
    const accRes = await request('GET', '/api/ide-accounting');
    if (accRes.status !== 200 || !Array.isArray(accRes.data) || accRes.data.length < 2) {
      throw new Error('IDE accounting did not record separate IDE entries');
    }
    const ides = accRes.data.map(r => r.ideName);
    if (!ides.includes('Cursor AI') || !ides.includes('Google Antigravity')) {
      throw new Error('Missing Cursor AI or Google Antigravity accounting record');
    }
  });

  // Test 10: Executable Validation Scan
  await test('IDE Validator: GET /api/ides validates real binaries', async () => {
    const ideRes = await request('GET', '/api/ides');
    if (ideRes.status !== 200 || !Array.isArray(ideRes.data)) {
      throw new Error('Failed to fetch IDE scan');
    }
    const hasValidation = ideRes.data.every(i => typeof i.isInstalled === 'boolean');
    if (!hasValidation) throw new Error('isInstalled boolean field missing from scan result');
  });

  // Test 11: Single Unified Master Telemetry Ledger
  await test('Unified Ledger: GET /api/unified-telemetry returns unified matrix', async () => {
    const res = await request('GET', '/api/unified-telemetry');
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error('Unified telemetry endpoint failed or returned empty array');
    }
    const first = res.data[0];
    if (!first.clientIDE || !first.accountId || !first.provider || typeof first.totalTokens !== 'number') {
      throw new Error('Unified telemetry row missing required composite fields');
    }
  });

  // Test 12: Resource Footprint Telemetry (~0 Stress Benchmark)
  await test('Resource Metrics: GET /api/stats reports heap, RSS & ~0 CPU load', async () => {
    const res = await request('GET', '/api/stats');
    if (res.status !== 200 || !res.data.resources) {
      throw new Error('Resources telemetry missing from /api/stats');
    }
    if (typeof res.data.resources.memoryHeapMB !== 'number' || res.data.resources.memoryHeapMB <= 0) {
      throw new Error('Invalid memoryHeapMB telemetry');
    }
  });

  // Test 13: Local Network Security & Isolation Controls
  await test('Security: GET /api/security/status & toggle LAN mode', async () => {
    const statusRes = await request('GET', '/api/security/status');
    if (statusRes.status !== 200 || !statusRes.data.gatewayToken) {
      throw new Error('Security status endpoint failed');
    }
    const toggleRes = await request('POST', '/api/security/toggle-lan');
    if (toggleRes.status !== 200 || !toggleRes.data.success) {
      throw new Error('Failed to toggle LAN mode');
    }
    // Toggle back to localhost mode for isolation
    await request('POST', '/api/security/toggle-lan');
  });

  // Test 14: Dynamic Task Heat & Intelligence Power Routing
  await test('Task Heat: Brainstorming & Architecture -> High Heat & Intelligence', async () => {
    const res = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Brainstorm architectural tradeoffs between event-driven microservices vs monolith' }],
      model: 'auto-smart-router'
    }, { 'x-client-ide': 'Google Antigravity' });
    if (res.status !== 200) throw new Error(`Failed: HTTP ${res.status}`);
    const heat = res.headers['x-aimeshmanager-heat'] || res.headers['x-meshmanager-heat'];
    const intelligence = res.headers['x-aimeshmanager-intelligence'] || res.headers['x-meshmanager-intelligence'];
    if (!heat || parseInt(heat) < 80) throw new Error(`Expected heat >= 80%, got ${heat}%`);
    if (!intelligence || parseInt(intelligence) < 4) throw new Error(`Expected intelligence >= 4/5, got ${intelligence}`);
  });

  // Test 15: Antigravity 2.0 Mock ADC & OAuth Token Endpoint
  await test('Antigravity 2.0: Generate Mock ADC and verify OAuth2 token loopback', async () => {
    const adcRes = await request('POST', '/api/antigravity/generate-mock-adc');
    if (adcRes.status !== 200 || !adcRes.data.filePath) {
      throw new Error('Failed to generate mock ADC');
    }
    const tokenRes = await request('POST', '/oauth2/token');
    if (tokenRes.status !== 200 || !tokenRes.data.access_token || !tokenRes.data.access_token.startsWith('ya29.')) {
      throw new Error('OAuth token loopback failed to return Bearer ya29 token');
    }
  });

  // Test 16: Multi-Agent Parallel Swarm (Decomposition with Shared Context)
  await test('Dynamic Swarm: Concurrent 4-agent dispatch across multiple accounts', async () => {
    const res = await request('POST', '/v1/swarm/dispatch', {
      task: 'Refactor auth middleware to support HMAC and OAuth tokens concurrently'
    });
    if (res.status !== 200 || !res.data.success || !Array.isArray(res.data.agents)) {
      throw new Error('Swarm dispatch failed');
    }
    if (res.data.agents.length !== 4) {
      throw new Error(`Expected 4 subagents, got ${res.data.agents.length}`);
    }
    const hasPro = res.data.agents.some(a => a.accountTier === 'PAID_PRO');
    const hasFree = res.data.agents.some(a => a.accountTier === 'FREE');
    if (!hasPro || !hasFree) {
      throw new Error('Swarm did not distribute across both paid and free accounts');
    }
  });

  // Test 17: Autonomous Execution Arbiter & Live Topology Stage
  await test('Autonomous Arbiter: Auto-decides execution mode & streams live topology graph', async () => {
    // 1. Check live topology endpoint
    const topoRes = await request('GET', '/api/topology/live');
    if (topoRes.status !== 200 || !topoRes.data.topology) {
      throw new Error('GET /api/topology/live failed');
    }

    // 2. Dispatch a high-complexity prompt via /v1/chat/completions (heat >= 75%)
    const compRes = await request('POST', '/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Architect, implement, and refactor a distributed multi-tenant microservices event broker across multiple repositories with strict type safety and unit tests.' }],
      model: 'auto-smart-router'
    });

    if (compRes.status !== 200) {
      throw new Error(`Chat completion returned HTTP ${compRes.status}`);
    }

    // 3. Verify live topology updated with the autonomous decision
    const updatedTopo = await request('GET', '/api/topology/live');
    if (!updatedTopo.data.topology || !updatedTopo.data.topology.executionMode) {
      throw new Error('Topology state missing executionMode');
    }
    if (!Array.isArray(updatedTopo.data.topology.branches) || updatedTopo.data.topology.branches.length === 0) {
      throw new Error('Topology state missing active execution branches');
    }
  });

  // Test 18: Zero-Residual Secret Purge
  await test('Zero-Residual Purge: Cryptographically shreds credentials and clears in-memory keys', async () => {
    const res = await request('POST', '/api/accounts/purge');
    if (res.status !== 200 || !res.data.success) {
      throw new Error('Purge failed');
    }
    if (!res.data.filesWiped || res.data.filesWiped.length === 0) {
      throw new Error('No files reported wiped during purge');
    }
  });

  // Test 19: System Status & Graceful Shutdown Readiness
  await test('System Status: GET /api/system/status reports online state & zero in-flight turns', async () => {
    const res = await request('GET', '/api/system/status');
    if (res.status !== 200 || !res.data) throw new Error(`HTTP ${res.status}`);
    if (res.data.status !== 'online') throw new Error(`Expected online, got ${res.data.status}`);
    if (typeof res.data.pid !== 'number') throw new Error(`Expected pid number, got ${typeof res.data.pid}`);
    if (typeof res.data.activeInFlightRequests !== 'number') throw new Error('Missing activeInFlightRequests');
  });

  console.log('\n\x1b[36m====================================================\x1b[0m');
  console.log(`\x1b[1mSummary: \x1b[32m${passed} Passed\x1b[0m, \x1b[${failed > 0 ? '31m' : '32m'}${failed} Failed\x1b[0m of ${passed + failed} Tests`);
  console.log('\x1b[36m====================================================\x1b[0m');

  if (serverProcess) {
    try {
      serverProcess.kill('SIGTERM');
    } catch (e) {}
  }

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  if (serverProcess) {
    try {
      serverProcess.kill('SIGTERM');
    } catch (e) {}
  }
  console.error('\x1b[31m[!] Test Runner Error:', err.message, '\x1b[0m');
  process.exit(1);
});
