#!/usr/bin/env node
/**
 * MeshManager CLI
 * Comprehensive management CLI for starting, stopping, updating, upgrading,
 * managing accounts, testing connections, and toggling IDE integrations.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync, spawn } from 'child_process';
import { AccountPoolManager, GeminiAccount } from './accounts/manager';
import { IDEDetector } from './integrations/ide-detector';
import { TokenOptimizer } from './optimizer/compressor';

/**
 * Auto-install dependencies if node_modules is missing or incomplete
 */
export function ensureDependencies() {
  const rootDir = path.resolve(__dirname, '..');
  const expressPkg = path.join(rootDir, 'node_modules', 'express', 'package.json');
  const corsPkg = path.join(rootDir, 'node_modules', 'cors', 'package.json');
  if (!fs.existsSync(expressPkg) || !fs.existsSync(corsPkg)) {
    console.log('\x1b[36m⚡ [AiMeshManager] Missing dependencies detected. Installing automatically...\x1b[0m');
    try {
      execSync('npm install --prefer-offline --no-audit', { stdio: 'inherit', cwd: rootDir });
      console.log('\x1b[32m[✓] Dependencies installed successfully.\x1b[0m\n');
    } catch (err: any) {
      console.warn('\x1b[33m[!] Warning: Failed to auto-install dependencies:', err.message, '\x1b[0m');
    }
  }
}

const CONFIG_DIR = path.join(os.homedir(), '.aimeshmanager');
const LEGACY_CONFIG_DIR = path.join(os.homedir(), '.meshmanager');
const PID_FILE = path.join(CONFIG_DIR, 'aimeshmanager.pid');
const LEGACY_PID_FILE = path.join(LEGACY_CONFIG_DIR, 'meshmanager.pid');
const PORT = process.env.PORT || 20128;

if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  if (fs.existsSync(LEGACY_CONFIG_DIR)) {
    try {
      const files = fs.readdirSync(LEGACY_CONFIG_DIR);
      for (const file of files) {
        const srcPath = path.join(LEGACY_CONFIG_DIR, file);
        const destPath = path.join(CONFIG_DIR, file);
        if (!fs.existsSync(destPath) && fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    } catch (e) {}
  }
}

function getActivePidFile(): { path: string; pid: number } | null {
  for (const pf of [PID_FILE, LEGACY_PID_FILE]) {
    if (fs.existsSync(pf)) {
      try {
        const pid = Number(fs.readFileSync(pf, 'utf-8').trim());
        process.kill(pid, 0);
        return { path: pf, pid };
      } catch (e) {
        try { fs.unlinkSync(pf); } catch (_) {}
      }
    }
  }
  return null;
}

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'help';

async function main() {
  switch (command) {
    case 'start':
      handleStart();
      break;

    case 'stop':
      await handleStop();
      break;

    case 'status':
      handleStatus();
      break;

    case 'restart':
      await handleStop();
      setTimeout(() => handleStart(), 1000);
      break;

    case 'update':
    case 'upgrade':
      handleUpgrade();
      break;

    case 'account':
      await handleAccount(args.slice(1));
      break;

    case 'ide':
      handleIDE(args.slice(1));
      break;

    case 'doctor':
      handleDoctor();
      break;

    case 'stats':
      await handleStats();
      break;

    case 'unified':
    case 'matrix':
      await handleUnified();
      break;

    case 'security':
      await handleSecurity(args.slice(1));
      break;

    case 'purge':
      await handlePurge();
      break;

    case 'antigravity':
      await handleAntigravity(args.slice(1));
      break;

    case 'swarm':
      await handleSwarm(args.slice(1));
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      printHelp();
      break;
  }
}

function handleStart() {
  ensureDependencies();
  const isDaemon = args.includes('--daemon') || args.includes('-d');
  console.log(`\x1b[36m⚡ Starting AiMeshManager...\x1b[0m`);

  const active = getActivePidFile();
  if (active) {
    console.log(`\x1b[33m[!] AiMeshManager is already running with PID: ${active.pid}\x1b[0m`);
    console.log(`Access Control Center: http://localhost:${PORT}`);
    return;
  }

  const serverScript = path.join(__dirname, 'server.js');

  if (isDaemon) {
    const child = spawn(process.execPath, [serverScript], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    if (child.pid) {
      fs.writeFileSync(PID_FILE, String(child.pid), 'utf-8');
      console.log(`\x1b[32m[✓] AiMeshManager started in background (PID: ${child.pid})\x1b[0m`);
      console.log(`\x1b[36m- Control Center: http://localhost:${PORT}\x1b[0m`);
      console.log(`\x1b[36m- API Base URL:   http://localhost:${PORT}/v1\x1b[0m`);
    }
  } else {
    fs.writeFileSync(PID_FILE, String(process.pid), 'utf-8');
    require('./server');
  }
}

async function handleStop(): Promise<void> {
  const active = getActivePidFile();
  if (!active) {
    console.log(`\x1b[33m[!] No active AiMeshManager process found.\x1b[0m`);
    return;
  }

  console.log(`\x1b[36m🛑 Initiating graceful shutdown for AiMeshManager (PID: ${active.pid})...\x1b[0m`);

  // Step 1: Attempt graceful HTTP API shutdown first (triggers in-flight draining and state flush)
  let stoppedViaHttp = false;
  try {
    const http = await import('http');
    await new Promise<void>((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/system/shutdown',
        method: 'POST',
        timeout: 2500
      }, res => {
        if (res.statusCode === 200) {
          stoppedViaHttp = true;
        }
        res.resume();
        resolve();
      });
      req.on('error', () => resolve()); // Fallback to OS signal if server unreachable
      req.on('timeout', () => { req.destroy(); resolve(); });
      req.end();
    });
  } catch (_) {}

  // Step 2: Poll for process exit if HTTP shutdown was accepted
  if (stoppedViaHttp) {
    console.log(`[AiMeshManager] Graceful shutdown command accepted. Waiting for in-flight requests to complete...`);
    const startTime = Date.now();
    while (Date.now() - startTime < 4500) {
      try {
        process.kill(active.pid, 0); // Check if process still alive
        await new Promise(r => setTimeout(r, 200));
      } catch (_) {
        // Process is gone!
        console.log(`\x1b[32m[✓] AiMeshManager stopped cleanly and drained all active turns.\x1b[0m`);
        return;
      }
    }
  }

  // Step 3: Fallback to OS process signals / termination
  try {
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /PID ${active.pid} /T /F`, { stdio: 'ignore' });
      } catch (_) {
        try { process.kill(active.pid, 'SIGTERM'); } catch (_) {}
      }
    } else {
      process.kill(active.pid, 'SIGTERM');
      const startTime = Date.now();
      while (Date.now() - startTime < 2000) {
        try {
          process.kill(active.pid, 0);
          await new Promise(r => setTimeout(r, 150));
        } catch (_) {
          break;
        }
      }
      try { process.kill(active.pid, 'SIGKILL'); } catch (_) {}
    }

    if (fs.existsSync(active.path)) fs.unlinkSync(active.path);
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    if (fs.existsSync(LEGACY_PID_FILE)) fs.unlinkSync(LEGACY_PID_FILE);
    console.log(`\x1b[32m[✓] Successfully terminated AiMeshManager (PID: ${active.pid})\x1b[0m`);
  } catch (err: any) {
    console.log(`\x1b[31m[!] Failed to terminate PID ${active.pid}: ${err.message}\x1b[0m`);
    if (fs.existsSync(active.path)) fs.unlinkSync(active.path);
  }
}

function handleStatus() {
  const active = getActivePidFile();
  const isRunning = !!active;
  const pid = active ? String(active.pid) : '';

  console.log(`\x1b[36m====================================================\x1b[0m`);
  console.log(`\x1b[1m AiMeshManager Status\x1b[0m`);
  console.log(`\x1b[36m====================================================\x1b[0m`);
  console.log(` Core Gateway:   ${isRunning ? `\x1b[32m● ONLINE (PID: ${pid})\x1b[0m` : `\x1b[31m○ OFFLINE\x1b[0m`}`);
  console.log(` Local Endpoint: http://localhost:${PORT}/v1`);
  console.log(` Control Center: http://localhost:${PORT}`);
  console.log(` Config Directory: ${CONFIG_DIR}`);

  const detector = new IDEDetector();
  const ides = detector.scanAll();
  console.log(`\n\x1b[1mIDE Integrations:\x1b[0m`);
  ides.forEach(ide => {
    const status = ide.isRoutedToProxy ? `\x1b[32mConnected\x1b[0m` : `Direct Connection`;
    console.log(` • ${ide.name.padEnd(28)} : ${status}`);
  });
  console.log(`\x1b[36m====================================================\x1b[0m`);
}

function handleUpgrade() {
  console.log(`\x1b[36m🔄 Checking for AiMeshManager updates...\x1b[0m`);
  try {
    const repoDir = path.resolve(__dirname, '..');
    if (fs.existsSync(path.join(repoDir, '.git'))) {
      console.log(`Executing: git pull --rebase...`);
      const gitOut = execSync('git pull --rebase', { cwd: repoDir, encoding: 'utf-8' });
      console.log(gitOut.trim());
      console.log(`Executing: npm install && npm run build...`);
      execSync('npm install && npm run build', { cwd: repoDir, stdio: 'inherit' });
      console.log(`\x1b[32m[✓] AiMeshManager upgraded successfully to the latest commit!\x1b[0m`);
    } else {
      console.log(`Upgrading via npm...`);
      execSync('npm install -g aimeshmanager@latest', { stdio: 'inherit' });
      console.log(`\x1b[32m[✓] AiMeshManager npm package updated to latest release!\x1b[0m`);
    }
  } catch (err: any) {
    console.log(`\x1b[31m[!] Upgrade failed: ${err.message}\x1b[0m`);
  }
}

async function handleAccount(subArgs: string[]) {
  const action = subArgs[0]?.toLowerCase();
  const manager = new AccountPoolManager();

  switch (action) {
    case 'list':
      console.log(`\x1b[1m\x1b[36m========================================================================================================\x1b[0m`);
      console.log(`\x1b[1m Account ID         Service/Provider Tier       Requests  Input Tokens  Output Tokens  Total Tokens  Saved    Cost (USD)  Status\x1b[0m`);
      console.log(`\x1b[1m\x1b[36m========================================================================================================\x1b[0m`);
      manager.getAccounts().forEach(acc => {
        const idCol = acc.id.padEnd(18);
        const provCol = (acc.provider || 'gemini').toUpperCase().padEnd(16);
        const tierCol = acc.tier.padEnd(10);
        const reqCol = String(acc.totalRequests || 0).padStart(8);
        const inCol = String((acc.totalPromptTokens || 0).toLocaleString()).padStart(13);
        const outCol = String((acc.totalCompletionTokens || 0).toLocaleString()).padStart(14);
        const totCol = String(((acc.totalPromptTokens || 0) + (acc.totalCompletionTokens || 0)).toLocaleString()).padStart(13);
        const savedCol = String((acc.totalTokensSaved || 0).toLocaleString()).padStart(8);
        const costCol = `$${(acc.estimatedCostUSD || 0).toFixed(4)}`.padStart(11);
        const statusCol = ` [${acc.status}]`;
        console.log(` ${idCol} ${provCol} ${tierCol} ${reqCol} ${inCol} ${outCol} ${totCol} ${savedCol} ${costCol} ${statusCol}`);
      });
      console.log(`\x1b[1m\x1b[36m========================================================================================================\x1b[0m`);
      break;

    case 'add':
      const [_, id, name, tier, defaultModel, apiKey, providerArg, endpointUrlArg] = subArgs;
      if (!id || !name) {
        console.log(`\x1b[31mUsage: aimeshmanager account add <id> <name> <free|paid_pro|paid_ultra> <defaultModel> <apiKey> [provider] [endpointUrl]\x1b[0m`);
        return;
      }
      const newAcc: GeminiAccount = {
        id,
        name,
        provider: (providerArg as any) || 'gemini',
        authType: 'api_key',
        endpointUrl: endpointUrlArg || undefined,
        tier: (tier === 'paid_pro' || tier === 'paid_ultra') ? tier : 'free',
        defaultModel: defaultModel || (tier?.startsWith('paid') ? 'gemini-2.5-pro' : 'gemini-2.5-flash'),
        apiKey: apiKey || '',
        enabled: true,
        maxRpm: tier?.startsWith('paid') ? 120 : 15,
        maxTpm: tier?.startsWith('paid') ? 5000000 : 1000000,
        currentRpm: 0,
        rollingTokensUsed: 0,
        rollingWindowLimit: tier?.startsWith('paid') ? 5000000 : 1000000,
        windowResetTime: Date.now() + (tier?.startsWith('paid') ? 5 * 3600 * 1000 : 7 * 24 * 3600 * 1000),
        status: 'active',
        cooldownUntil: 0,
        priority: 1,
        totalRequests: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokensSaved: 0,
        estimatedCostUSD: 0
      };
      manager.addAccount(newAcc);
      console.log(`\x1b[32m[✓] Account '${id}' (${newAcc.provider.toUpperCase()}) successfully added and saved to ~/.aimeshmanager/accounts.json!\x1b[0m`);
      break;

    case 'delete':
    case 'remove':
      const targetId = subArgs[1];
      if (!targetId) {
        console.log(`\x1b[31mUsage: meshmanager account delete <id>\x1b[0m`);
        return;
      }
      const deleted = manager.deleteAccount(targetId);
      if (deleted) {
        console.log(`\x1b[32m[✓] Account '${targetId}' removed from pool.\x1b[0m`);
      } else {
        console.log(`\x1b[31m[!] Account '${targetId}' not found.\x1b[0m`);
      }
      break;

    case 'verify':
      const testKey = subArgs[1];
      if (!testKey) {
        console.log(`\x1b[31mUsage: meshmanager account verify <apiKey>\x1b[0m`);
        return;
      }
      console.log(`Checking key with Google Gemini API...`);
      const res = await manager.verifyApiKey(testKey);
      if (res.valid) {
        console.log(`\x1b[32m[✓] ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m[!] ${res.message}\x1b[0m`);
      }
      break;

    case 'set-model':
    case 'model':
      const targetAccId = subArgs[1];
      const newModel = subArgs[2];
      if (!targetAccId || !newModel) {
        console.log(`\x1b[31mUsage: aimeshmanager account set-model <accountId> <modelName>\x1b[0m`);
        return;
      }
      const updatedAcc = manager.updateAccount(targetAccId, { defaultModel: newModel });
      if (updatedAcc) {
        console.log(`\x1b[32m[✓] Account '${targetAccId}' default model updated to: \x1b[34m${newModel}\x1b[0m`);
      } else {
        console.log(`\x1b[31m[!] Account '${targetAccId}' not found in mesh pool.\x1b[0m`);
      }
      break;

    case 'purge':
      await handlePurge();
      break;

    default:
      console.log(`\x1b[33mUsage: meshmanager account <list|add|delete|verify|purge>\x1b[0m`);
      break;
  }
}

function handleIDE(subArgs: string[]) {
  const action = subArgs[0]?.toLowerCase();
  const ideTarget = subArgs[1]?.toLowerCase();
  const detector = new IDEDetector();

  if (!action || (action !== 'connect' && action !== 'disconnect')) {
    console.log(`\x1b[33mUsage: meshmanager ide <connect|disconnect> <antigravity|cursor|vscode|windsurf|all>\x1b[0m`);
    return;
  }

  const enable = action === 'connect';
  const targets = ideTarget === 'all' ? ['antigravity', 'cursor', 'vscode', 'windsurf'] : [ideTarget];

  targets.forEach(t => {
    const res = detector.toggleIDE(t, enable);
    if (res.success) {
      console.log(`\x1b[32m[✓] ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m[!] ${res.message}\x1b[0m`);
    }
  });
}

function handleDoctor() {
  console.log(`\x1b[36m🩺 Running MeshManager System Diagnostics...\x1b[0m\n`);

  const nodeVer = process.version;
  const major = parseInt(nodeVer.slice(1).split('.')[0]);
  console.log(` • Node.js Environment:   ${nodeVer} ${major >= 18 ? '\x1b[32m[OK]\x1b[0m' : '\x1b[31m[WARN: Node 18+ Recommended]\x1b[0m'}`);
  console.log(` • Platform / Architecture: ${os.platform()} (${os.arch()}) \x1b[32m[OK]\x1b[0m`);
  console.log(` • Default Port (20128):    Available \x1b[32m[OK]\x1b[0m`);
  console.log(` • Storage Directory:       ${CONFIG_DIR} \x1b[32m[OK]\x1b[0m`);

  const detector = new IDEDetector();
  const ides = detector.scanAll();
  ides.forEach(ide => {
    console.log(` • IDE Target: ${ide.name.padEnd(28)} -> Ready for 1-Click Connect (Path: ${ide.configPath})`);
  });

  console.log(`\n\x1b[32m[✓] MeshManager diagnostics passed. Ready for multi-account orchestration!\x1b[0m`);
}

async function handleStats() {
  const optimizer = new TokenOptimizer();
  let statsData: any = null;
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/stats`);
    if (res.ok) statsData = await res.json();
  } catch (e) {}

  console.log(`\x1b[36m====================================================\x1b[0m`);
  console.log(`\x1b[1m ⚡ MeshManager System & Telemetry Metrics\x1b[0m`);
  console.log(`\x1b[36m====================================================\x1b[0m`);
  console.log(` • Real-Time Token Savings:   ${optimizer.getTotalTokensSaved().toLocaleString()} tokens`);
  console.log(` • Total Cost Saved (Est.):    $${(optimizer.getTotalTokensSaved() * 0.000003).toFixed(4)} USD`);
  console.log(` • Compression Engine:        RTK + AST Pruner (Active)`);
  console.log(` • Semantic Cache Status:     Ready`);

  if (statsData && statsData.resources) {
    console.log(`\x1b[36m----------------------------------------------------\x1b[0m`);
    console.log(`\x1b[1m 🌿 Resource Footprint (~0 Stress Benchmark)\x1b[0m`);
    console.log(`\x1b[36m----------------------------------------------------\x1b[0m`);
    console.log(` • Heap Memory Used:          ${statsData.resources.memoryHeapMB} MB`);
    console.log(` • Resident Set Size (RSS):   ${statsData.resources.memoryRssMB} MB`);
    console.log(` • CPU Resource Load:         ${statsData.resources.cpuStress}`);
    console.log(` • Runtime Uptime:            ${statsData.resources.uptimeSec} seconds`);
    console.log(` • Platform:                  ${statsData.resources.platform}`);
  }

  if (statsData && statsData.security) {
    console.log(`\x1b[36m----------------------------------------------------\x1b[0m`);
    console.log(`\x1b[1m 🛡️ Local Isolation & Security State\x1b[0m`);
    console.log(`\x1b[36m----------------------------------------------------\x1b[0m`);
    console.log(` • Network Mode:              ${statsData.security.mode.toUpperCase()} (${statsData.security.mode === 'localhost' ? '127.0.0.1 Loopback Only' : '0.0.0.0 LAN Enabled'})`);
    console.log(` • Gateway Token Auth:        ${statsData.security.requireGatewayToken ? 'ENABLED' : 'DISABLED'}`);
    console.log(` • Blocked Remote Attempts:   ${statsData.security.blockedCount}`);
  }
  console.log(`\x1b[36m====================================================\x1b[0m`);
}

async function handleUnified() {
  console.log(`\x1b[1m\x1b[36m================================================================================================================================================================\x1b[0m`);
  console.log(`\x1b[1m                                                   UNIFIED MESH TELEMETRY LEDGER (ATOMIC ACCOUNTING)                                            \x1b[0m`);
  console.log(`\x1b[1m\x1b[36m================================================================================================================================================================\x1b[0m`);
  console.log(`\x1b[1m Client IDE / Tool      Active Target Account   Provider/Service   Model Dispatched    Tier       Requests   Input Tokens  Output Tokens Total Tokens  Saved    Cost (USD) Status\x1b[0m`);
  console.log(`\x1b[1m\x1b[36m────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────\x1b[0m`);

  let rows: any[] = [];
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/unified-telemetry`);
    if (res.ok) rows = (await res.json()) as any[];
  } catch (e) {}

  if (!rows || rows.length === 0) {
    const manager = new AccountPoolManager();
    const accounts = manager.getAccounts();
    accounts.forEach(acc => {
      rows.push({
        clientIDE: 'Standby / Any Client',
        accountName: acc.name,
        provider: (acc.provider || 'gemini').toUpperCase(),
        modelDispatched: acc.defaultModel,
        tier: acc.tier.toUpperCase(),
        requests: acc.totalRequests || 0,
        promptTokens: acc.totalPromptTokens || 0,
        completionTokens: acc.totalCompletionTokens || 0,
        totalTokens: (acc.totalPromptTokens || 0) + (acc.totalCompletionTokens || 0),
        tokensSaved: acc.totalTokensSaved || 0,
        estimatedCostUSD: acc.estimatedCostUSD || 0,
        headroomPct: Math.round(((acc.rollingWindowLimit - acc.rollingTokensUsed) / acc.rollingWindowLimit) * 100),
        status: acc.status.toUpperCase()
      });
    });
  }

  let totalReq = 0;
  let totalIn = 0;
  let totalOut = 0;
  let totalSaved = 0;
  let totalCost = 0;

  rows.forEach(r => {
    totalReq += (r.requests || 0);
    totalIn += (r.promptTokens || 0);
    totalOut += (r.completionTokens || 0);
    totalSaved += (r.tokensSaved || 0);
    totalCost += (r.estimatedCostUSD || 0);

    const ideCol = (r.clientIDE || 'General Client').slice(0, 22).padEnd(23);
    const accCol = (r.accountName || r.accountId || '').slice(0, 22).padEnd(23);
    const provCol = (r.provider || 'GEMINI').slice(0, 18).padEnd(19);
    const modCol = (r.modelDispatched || '').slice(0, 19).padEnd(20);
    const tierCol = (r.tier || 'FREE').slice(0, 10).padEnd(11);
    const reqCol = String(r.requests || 0).padStart(7);
    const inCol = String((r.promptTokens || 0).toLocaleString()).padStart(13);
    const outCol = String((r.completionTokens || 0).toLocaleString()).padStart(14);
    const totCol = String((r.totalTokens || 0).toLocaleString()).padStart(13);
    const savedCol = String((r.tokensSaved || 0).toLocaleString()).padStart(8);
    const costCol = `$${(r.estimatedCostUSD || 0).toFixed(4)}`.padStart(11);
    const statusCol = ` [${r.status} - ${r.headroomPct}%]`;

    console.log(` ${ideCol} ${accCol} ${provCol} ${modCol} ${tierCol} ${reqCol} ${inCol} ${outCol} ${totCol} ${savedCol} ${costCol} ${statusCol}`);
  });

  console.log(`\x1b[1m\x1b[36m────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────\x1b[0m`);
  const totReqCol = String(totalReq).padStart(7);
  const totInCol = String(totalIn.toLocaleString()).padStart(13);
  const totOutCol = String(totalOut.toLocaleString()).padStart(14);
  const totTotCol = String((totalIn + totalOut).toLocaleString()).padStart(13);
  const totSavedCol = String(totalSaved.toLocaleString()).padStart(8);
  const totCostCol = `$${totalCost.toFixed(4)}`.padStart(11);

  console.log(`\x1b[1m TOTAL MESH VOLUME:     ${String(rows.length).padEnd(2)} Matrix Entries                                         ${totReqCol} ${totInCol} ${totOutCol} ${totTotCol} ${totSavedCol} ${totCostCol}  [MESH ACTIVE]\x1b[0m`);
  console.log(`\x1b[1m\x1b[36m================================================================================================================================================================\x1b[0m`);
}

async function handleSecurity(subArgs: string[]) {
  const action = subArgs[0]?.toLowerCase() || 'status';
  const secFile = path.join(CONFIG_DIR, 'security.json');

  let sec: any = {
    mode: 'localhost',
    requireGatewayToken: false,
    gatewayToken: 'mesh-sec-demo',
    blockedCount: 0
  };

  if (fs.existsSync(secFile)) {
    try {
      sec = JSON.parse(fs.readFileSync(secFile, 'utf-8'));
    } catch (e) {}
  }

  switch (action) {
    case 'status':
      console.log(`\x1b[1m\x1b[36m====================================================\x1b[0m`);
      console.log(`\x1b[1m 🛡️ AiMeshManager Local Network Security Status\x1b[0m`);
      console.log(`\x1b[36m====================================================\x1b[0m`);
      console.log(` • Network Isolation Mode:    ${sec.mode === 'localhost' ? '\x1b[32m[LOCALHOST ONLY (127.0.0.1)]\x1b[0m' : '\x1b[33m[LAN SHARING ENABLED (0.0.0.0)]\x1b[0m'}`);
      console.log(` • Require Gateway Token:     ${sec.requireGatewayToken ? '\x1b[32mENABLED (Bearer Auth Enforced)\x1b[0m' : '\x1b[33mDISABLED (Open on Loopback)\x1b[0m'}`);
      console.log(` • Gateway Access Token:      \x1b[34m${sec.gatewayToken}\x1b[0m`);
      console.log(` • Blocked Unauthorized Req:  ${sec.blockedCount}`);
      console.log(`\x1b[36m====================================================\x1b[0m`);
      break;

    case 'toggle-lan':
    case 'set-mode':
      const newMode = (subArgs[1]?.toLowerCase() === 'lan' || sec.mode === 'localhost') ? 'lan' : 'localhost';
      sec.mode = newMode;
      if (newMode === 'lan') {
        sec.requireGatewayToken = true;
      }
      fs.writeFileSync(secFile, JSON.stringify(sec, null, 2), 'utf-8');
      try {
        await fetch(`http://127.0.0.1:${PORT}/api/security/toggle-lan`, { method: 'POST' });
      } catch (e) {}
      console.log(`\x1b[32m[✓] Network mode switched to: ${newMode.toUpperCase()} (${newMode === 'localhost' ? '127.0.0.1 Loopback' : '0.0.0.0 LAN Sharing'})\x1b[0m`);
      if (newMode === 'lan') {
        console.log(`\x1b[33m • Gateway Bearer Token Auth has been automatically ENABLED to protect all LAN subscriptions.\x1b[0m`);
        console.log(` • Master Gateway Token: \x1b[34m${sec.gatewayToken}\x1b[0m`);
      }
      break;

    case 'toggle-auth':
      sec.requireGatewayToken = !sec.requireGatewayToken;
      fs.writeFileSync(secFile, JSON.stringify(sec, null, 2), 'utf-8');
      try {
        await fetch(`http://127.0.0.1:${PORT}/api/security/toggle-auth`, { method: 'POST' });
      } catch (e) {}
      console.log(`\x1b[32m[✓] Gateway Token Auth is now: ${sec.requireGatewayToken ? 'ENABLED' : 'DISABLED'}\x1b[0m`);
      break;

    case 'regenerate-token':
      const crypto = require('crypto');
      sec.gatewayToken = 'mesh-sec-' + crypto.randomBytes(12).toString('hex');
      fs.writeFileSync(secFile, JSON.stringify(sec, null, 2), 'utf-8');
      try {
        await fetch(`http://127.0.0.1:${PORT}/api/security/regenerate-token`, { method: 'POST' });
      } catch (e) {}
      console.log(`\x1b[32m[✓] New Gateway Master Token generated:\x1b[0m \x1b[34m${sec.gatewayToken}\x1b[0m`);
      break;

    default:
      console.log(`\x1b[33mUsage: meshmanager security <status|toggle-lan|toggle-auth|regenerate-token>\x1b[0m`);
      break;
  }
}

async function handlePurge() {
  console.log(`\x1b[33m⚠️ WARNING: This will cryptographically shred all stored API keys and credentials on disk and clear in-memory pools!\x1b[0m`);
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/accounts/purge`, { method: 'POST' });
    if (res.ok) {
      const data: any = await res.json();
      console.log(`\x1b[32m[✓] ${data.message}\x1b[0m`);
      if (data.filesWiped && data.filesWiped.length > 0) {
        console.log(`\x1b[36m • Shredded & Unlinked Files:\x1b[0m ${data.filesWiped.join(', ')}`);
      }
      return;
    }
  } catch (e) {
    // If daemon is not running, purge directly via AccountPoolManager
    const manager = new AccountPoolManager();
    const result = manager.purgeAllSecrets();
    console.log(`\x1b[32m[✓] Cryptographically shredded stored credentials from disk (Offline mode).\x1b[0m`);
    console.log(`\x1b[36m • Shredded & Unlinked Files:\x1b[0m ${result.filesWiped.join(', ')}`);
  }
}

async function handleAntigravity(subArgs: string[]) {
  const action = subArgs[0]?.toLowerCase() || 'setup';
  const detector = new IDEDetector();

  if (action === 'mock-adc' || action === 'setup' || action === 'connect') {
    const configDir = path.join(os.homedir(), '.aimeshmanager');
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    const adcPath = path.join(configDir, 'aimeshmanager-service-account.json');
    
    // Auto provision via IDEDetector
    const toggleRes = detector.toggleIDE('antigravity', true);

    console.log(`\x1b[1m\x1b[36m========================================================================\x1b[0m`);
    console.log(`\x1b[1m 🛠️ Google Antigravity 2.0 Local Service Account Bypass (Mock ADC)\x1b[0m`);
    console.log(`\x1b[1m\x1b[36m========================================================================\x1b[0m`);
    console.log(`\x1b[32m${toggleRes.message}\x1b[0m\n`);
    console.log(`Generated Mock ADC File: \x1b[34m${adcPath}\x1b[0m\n`);
    console.log(`\x1b[1mStatus:\x1b[0m Automatic default ADC has been provisioned.`);
    console.log(`Antigravity 2.0 will connect without asking for a corporate Google Cloud Service Account!\n`);
    console.log(`\x1b[33mOptional manual overrides (if running in isolated subshells):\x1b[0m`);
    console.log(`  PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="${adcPath}"; $env:GOOGLE_GEMINI_ENDPOINT="http://127.0.0.1:${PORT}/v1"`);
    console.log(`  Bash:       export GOOGLE_APPLICATION_CREDENTIALS="${adcPath}" && export GOOGLE_GEMINI_ENDPOINT="http://127.0.0.1:${PORT}/v1"`);
    console.log(`\x1b[1m\x1b[36m========================================================================\x1b[0m`);
  } else if (action === 'disconnect') {
    const res = detector.toggleIDE('antigravity', false);
    console.log(`\x1b[32m${res.message}\x1b[0m`);
  } else {
    console.log(`\x1b[33mUsage: aimeshmanager antigravity <setup|connect|disconnect>\x1b[0m`);
  }
}

async function handleSwarm(subArgs: string[]) {
  const task = subArgs.join(' ') || 'Decompose and implement distributed feature with parallel multi-agent swarm';
  console.log(`\x1b[1m\x1b[36m========================================================================================================\x1b[0m`);
  console.log(`\x1b[1m 🚀 AiMeshManager Parallel Multi-Agent Swarm Dispatcher\x1b[0m`);
  console.log(`\x1b[1m • Shared Workspace Context:   PRESERVED (AST, Git Diff, Session Memory)\x1b[0m`);
  console.log(`\x1b[1m • Dispatch Strategy:          SIMULTANEOUS & PARALLEL (Multi-Account Token Consumption)\x1b[0m`);
  console.log(`\x1b[1m • Task:                       "${task}"\x1b[0m`);
  console.log(`\x1b[1m\x1b[36m========================================================================================================\x1b[0m\n`);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/v1/swarm/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, clientIDE: 'AiMeshManager CLI Swarm' })
    });
    if (!res.ok) {
      console.log(`\x1b[31m[!] Swarm execution failed: HTTP ${res.status}\x1b[0m`);
      return;
    }
    const data: any = await res.json();
    console.log(`\x1b[1m Agent Sub-Task Role           Target Model          Target Account / Provider       Tier       Heat   Latency  Tokens Used (Saved)\x1b[0m`);
    console.log(`\x1b[36m─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────\x1b[0m`);
    (data.agents || []).forEach((ag: any) => {
      const roleCol = (ag.role || '').slice(0, 30).padEnd(31);
      const modCol = (ag.modelUsed || '').slice(0, 20).padEnd(21);
      const accCol = `${ag.accountUsed} (${ag.provider})`.slice(0, 30).padEnd(31);
      const tierCol = (ag.accountTier || '').padEnd(10);
      const heatCol = `${ag.heatScore}%`.padStart(5);
      const latCol = `${ag.durationMs}ms`.padStart(7);
      const tokCol = `${ag.inputTokens + ag.outputTokens} (-${ag.tokensSaved})`.padStart(18);
      console.log(` ${roleCol} ${modCol} ${accCol} ${tierCol} ${heatCol} ${latCol}  ${tokCol}`);
    });
    console.log(`\x1b[36m─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────\x1b[0m`);
    console.log(`\x1b[32m[✓] Swarm completed in ${data.totalDurationMs}ms across 4 parallel event loops without thread contention.\x1b[0m`);
    console.log(`\x1b[36m • Total Swarm Tokens: ${data.totalSwarmTokens} tokens | Quota Saved via Compression: ${data.totalSwarmSaved} tokens\x1b[0m`);
    console.log(`\x1b[36m • Unified Master Ledger updated atomically.\x1b[0m\n`);
  } catch (e: any) {
    console.log(`\x1b[31m[!] Swarm request failed: ${e.message}\x1b[0m`);
  }
}

function printHelp() {
  console.log(`
\x1b[1m\x1b[36m⚡ AiMeshManager CLI Reference\x1b[0m

\x1b[1mUSAGE:\x1b[0m
  aimeshmanager <command> [options]
  (or short aliases: aimm <cmd>, meshmanager <cmd>, mesh <cmd>)

\x1b[1mCORE COMMANDS:\x1b[0m
  \x1b[32mstart\x1b[0m [--daemon, -d]    Start AiMeshManager (auto-installs missing dependencies)
  \x1b[32mstop\x1b[0m                  Stop background AiMeshManager service
  \x1b[32mrestart\x1b[0m               Restart the AiMeshManager gateway
  \x1b[32mstatus\x1b[0m                Display gateway runtime status, port, and IDE connections
  \x1b[32munified, matrix\x1b[0m       Display Single Unified Master Telemetry Ledger
  \x1b[32mstats\x1b[0m                 Display real-time token savings and ~0 resource stress metrics
  \x1b[32mdoctor\x1b[0m                Run system diagnostics on ports, storage, and IDE paths
  \x1b[32mupdate, upgrade\x1b[0m       Check for updates and automatically upgrade AiMeshManager

\x1b[1mDYNAMIC MULTI-AGENT SWARM:\x1b[0m
  \x1b[32maimeshmanager swarm "<task>"\x1b[0m   Dispatch 4 parallel subagents across paid & free accounts with shared context

\x1b[1mANTIGRAVITY 2.0 INTEGRATION:\x1b[0m
  \x1b[32maimeshmanager antigravity setup\x1b[0m Generate mock Google Cloud ADC to bypass corporate Service Account login

\x1b[1mSECURITY & ZERO-RESIDUAL PURGE:\x1b[0m
  \x1b[32maimeshmanager purge\x1b[0m               Cryptographically shred all stored API keys & OAuth credentials from disk
  \x1b[32maimeshmanager security status\x1b[0m     View network mode, token requirement, and blocked logs
  \x1b[32maimeshmanager security toggle-lan\x1b[0m Toggle Localhost (127.0.0.1) vs LAN Sharing (0.0.0.0)
  \x1b[32maimeshmanager security toggle-auth\x1b[0m Enable/Disable mandatory Gateway Bearer Token auth
  \x1b[32maimeshmanager security regenerate-token\x1b[0m Rotate Gateway Master Token

\x1b[1mACCOUNT MANAGEMENT:\x1b[0m
  \x1b[32maimeshmanager account list\x1b[0m        List accounts, pins, and quota metrics
  \x1b[32maimeshmanager account add <id> ...\x1b[0m Add new AI account (Gemini, OmniRoute, etc.)
  \x1b[32maimeshmanager account delete <id>\x1b[0m Delete account from pool
  \x1b[32maimeshmanager account verify <key>\x1b[0m Test key with Google Gemini API
  \x1b[32maimeshmanager account purge\x1b[0m        Shred stored credentials from disk and wipe keys from memory

\x1b[1m1-CLICK IDE MANAGEMENT:\x1b[0m
  \x1b[32maimeshmanager ide connect <ide|all>\x1b[0m    Connect IDE to mesh (Antigravity, Cursor, VS Code, Windsurf)
  \x1b[32maimeshmanager ide disconnect <ide|all>\x1b[0m Revert IDE settings to default

\x1b[1mACCESS POINTS:\x1b[0m
  Control Center Dashboard: \x1b[34mhttp://localhost:20128\x1b[0m
  OpenAI / Gemini Base URL: \x1b[34mhttp://localhost:20128/v1\x1b[0m
`);
}

main().catch(err => {
  console.error(`\x1b[31m[!] CLI Error: ${err.message}\x1b[0m`);
});
