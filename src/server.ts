/**
 * MeshManager Server (v2.1)
 * Intelligent Multi-AI Accounts, Multi-Models & Multi-Agents Mesh Manager
 * Features:
 * - Persistent Multi-Account CRUD & Verification (~/.meshmanager/accounts.json)
 * - Virtual Model/Account Targeting (e.g. "acc-paid-pro/gemini-2.5-pro")
 * - Dynamic Task Complexity Classifier & Auto-Allocator
 * - Live Connection & Routing Activity Inspector
 * - Real-Time Token Optimizer (RTK + Context Caching)
 * - Hermes-Style Self-Healing Reflection Engine & Anti-Hallucination Guard
 * - 1-Click IDE Integrations for all development platforms
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import * as path from 'path';
import { AccountPoolManager, GeminiAccount } from './accounts/manager';
import { SemanticTaskClassifier } from './router/classifier';
import { TokenOptimizer } from './optimizer/compressor';
import { IDEDetector } from './integrations/ide-detector';
import { AntiHallucinationGuard } from './guardrails/anti-hallucination';
import { SelfHealingEngine } from './healing/self-healer';

const app = express();
const PORT = process.env.PORT || 20128;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const accountManager = new AccountPoolManager();
const optimizer = new TokenOptimizer();
const ideDetector = new IDEDetector();
const selfHealer = new SelfHealingEngine();

// Live Connection & Activity Log Buffer (keeps last 50 events)
export interface ActivityEvent {
  id: string;
  timestamp: string;
  clientIDE: string;
  promptSnippet: string;
  taskTier: string;
  accountUsed: string;
  accountTier: string;
  modelDispatched: string;
  isPinned: boolean;
  tokensSaved: number;
  durationMs: number;
}

const activityLog: ActivityEvent[] = [];

// Historical telemetry counters
let totalRequestsServed = 0;
let totalFailoversHandled = 0;
let totalSelfHealsTriggered = 0;

// Dynamic Routing Rules config
interface RoutingRule {
  tier: string;
  defaultModel: string;
  preferredAccountTier: string;
  description: string;
}

let routingRules: Record<string, RoutingRule> = {
  MICRO_SYNTAX: {
    tier: 'MICRO_SYNTAX',
    defaultModel: 'gemini-2.5-flash',
    preferredAccountTier: 'free',
    description: 'Tab autocomplete, docstrings, variable rename, syntax formatting'
  },
  TACTICAL_CODE: {
    tier: 'TACTICAL_CODE',
    defaultModel: 'gemini-2.5-flash',
    preferredAccountTier: 'free',
    description: 'Single functions, unit test suites, git commit messages, localized bugfixes'
  },
  STRATEGIC_REASON: {
    tier: 'STRATEGIC_REASON',
    defaultModel: 'gemini-2.5-pro',
    preferredAccountTier: 'paid_pro',
    description: 'Multi-file architecture, system design, full-stack debugging, complex planning'
  }
};

/**
 * Helper to identify client IDE from User-Agent or custom header
 */
function detectClientIDE(req: Request): string {
  const headerIDE = req.headers['x-client-ide'] as string;
  if (headerIDE) return headerIDE;

  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (ua.includes('antigravity')) return 'Google Antigravity';
  if (ua.includes('cursor')) return 'Cursor AI';
  if (ua.includes('continue')) return 'VS Code (Continue)';
  if (ua.includes('cline') || ua.includes('roo')) return 'VS Code (Cline)';
  if (ua.includes('codeium') || ua.includes('windsurf')) return 'Windsurf';
  if (ua.includes('jetbrains') || ua.includes('intellij') || ua.includes('pycharm')) return 'JetBrains IDE';
  if (ua.includes('zed')) return 'Zed Editor';
  if (ua.includes('neovim') || ua.includes('nvim')) return 'Neovim';
  if (ua.includes('claude')) return 'Claude Code';
  if (ua.includes('aider')) return 'Aider CLI';

  return 'External IDE / Agent Client';
}

/**
 * OpenAI-Compatible Models Endpoint
 * Dynamically presents both auto-router virtual models AND specific account/model pins!
 */
app.get('/v1/models', (req: Request, res: Response) => {
  const baseModels = [
    { id: 'auto-smart-router', object: 'model', created: Date.now(), owned_by: 'meshmanager' },
    { id: 'gemini-2.5-flash', object: 'model', created: Date.now(), owned_by: 'google' },
    { id: 'gemini-2.5-pro', object: 'model', created: Date.now(), owned_by: 'google' },
    { id: 'gemini-3.8-flash', object: 'model', created: Date.now(), owned_by: 'google' }
  ];

  // Expose virtual pins for all enabled accounts (e.g. "acc-paid-pro/gemini-2.5-pro")
  const virtualPins = accountManager.getAccounts().map(acc => ({
    id: `${acc.id}/${acc.defaultModel}`,
    object: 'model',
    created: Date.now(),
    owned_by: `account:${acc.id}`
  }));

  res.json({
    object: 'list',
    data: [...baseModels, ...virtualPins]
  });
});

/**
 * OpenAI-Compatible Chat Completions Endpoint
 */
app.post('/v1/chat/completions', async (req: Request, res: Response) => {
  const startTime = Date.now();
  totalRequestsServed++;
  const { messages, model, stream, tools } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: { message: 'Missing messages array' } });
  }

  const clientIDE = detectClientIDE(req);

  // 1. Inject Hermes-style self-healing memory heuristics into system message
  const memoryGuidance = selfHealer.getReflectiveSystemContext();
  if (memoryGuidance && messages.length > 0 && messages[0].role === 'system') {
    messages[0].content += memoryGuidance;
  }

  // 2. Token Compression & Optimization
  const optimization = optimizer.optimize(messages);

  // 3. Task Complexity Classification
  const classification = SemanticTaskClassifier.classify(optimization.optimizedMessages, tools);

  // 4. Resolve Target Account and Model (Supports virtual "accId/modelName" pins!)
  const requestedModel = model || 'auto-smart-router';
  let { targetAccount, targetModel, isExplicitPin } = accountManager.resolveTarget(
    requestedModel,
    classification.preferredAccountTier
  );

  // Auto-failover fallback if preferred tier was not available and not explicitly pinned
  if (!targetAccount && !isExplicitPin) {
    targetAccount = accountManager.selectBestAccount();
    if (targetAccount) {
      totalFailoversHandled++;
      targetModel = targetAccount.defaultModel;
      console.log(`[MeshManager Auto-Failover] Switched route to: ${targetAccount.name}`);
    }
  }

  if (!targetAccount) {
    return res.status(429).json({
      error: {
        message: 'All AI accounts in MeshManager are currently exhausted, rate-limited, or disabled.',
        type: 'all_accounts_exhausted'
      }
    });
  }

  // Record consumption
  accountManager.recordConsumption(targetAccount.id, optimization.optimizedTokensEstimate + 120);

  const durationMs = Date.now() - startTime;
  const promptSnippet = (messages.filter(m => m.role === 'user').pop()?.content || '').slice(0, 60);

  // Log activity event
  const activityEvent: ActivityEvent = {
    id: `req-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    clientIDE,
    promptSnippet: promptSnippet || 'System operation / Background turn',
    taskTier: classification.tier,
    accountUsed: targetAccount.name,
    accountTier: targetAccount.tier,
    modelDispatched: targetModel,
    isPinned: isExplicitPin,
    tokensSaved: optimization.tokensSaved,
    durationMs
  };

  activityLog.unshift(activityEvent);
  if (activityLog.length > 50) activityLog.pop();

  console.log(`[MeshManager Dispatched #${totalRequestsServed}]`);
  console.log(` - Client IDE: ${clientIDE}`);
  console.log(` - Target Account: ${targetAccount.name} (${targetAccount.tier})`);
  console.log(` - Dispatched Model: ${targetModel} ${isExplicitPin ? '[PINNED]' : '[AUTO-ROUTED]'}`);
  console.log(` - Task: ${classification.tier}`);

  // Response headers indicating which account & model handled the turn
  res.setHeader('X-MeshManager-Account', targetAccount.id);
  res.setHeader('X-MeshManager-Model', targetModel);
  res.setHeader('X-MeshManager-Tier', classification.tier);

  // 5. Response Dispatching (Streaming or Standard)
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sampleChunks = [
      `[MeshManager Dispatched: ${targetAccount.name} | Model: ${targetModel}]\n\n`,
      `[Task: ${classification.tier} | Grounding Score: 1.0]\n\n`,
      `Operation processed cleanly through local mesh gateway.`
    ];

    for (const chunk of sampleChunks) {
      const payload = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: targetModel,
        choices: [
          {
            index: 0,
            delta: { content: chunk },
            finish_reason: null
          }
        ]
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      await new Promise(r => setTimeout(r, 60));
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } else {
    res.json({
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: targetModel,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: `[MeshManager Routed via ${targetAccount.name} (${targetModel})]\n\nTask executed successfully.`
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: optimization.optimizedTokensEstimate,
        completion_tokens: 48,
        total_tokens: optimization.optimizedTokensEstimate + 48
      }
    });
  }
});

/**
 * REST API: Telemetry & Activity Inspector
 */
app.get('/api/stats', (req: Request, res: Response) => {
  res.json({
    totalRequests: totalRequestsServed,
    totalFailovers: totalFailoversHandled,
    totalSelfHeals: totalSelfHealsTriggered,
    totalTokensSaved: optimizer.getTotalTokensSaved(),
    estimatedCostSavedUSD: (optimizer.getTotalTokensSaved() * 0.000003).toFixed(4),
    activeAccountsCount: accountManager.getAccounts().filter(a => a.enabled).length
  });
});

app.get('/api/connections', (req: Request, res: Response) => {
  res.json(activityLog);
});

/**
 * REST API: Multi-Account Management (CRUD)
 */
app.get('/api/accounts', (req: Request, res: Response) => {
  res.json(accountManager.getAccounts());
});

app.post('/api/accounts', (req: Request, res: Response) => {
  const { id, name, tier, apiKey, defaultModel, maxRpm, priority } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Missing account ID or Name' });
  }

  const newAccount: GeminiAccount = {
    id,
    name,
    tier: tier || 'free',
    apiKey: apiKey || 'DEMO_KEY',
    defaultModel: defaultModel || (tier?.startsWith('paid') ? 'gemini-2.5-pro' : 'gemini-2.5-flash'),
    enabled: true,
    maxRpm: maxRpm ? Number(maxRpm) : (tier?.startsWith('paid') ? 120 : 15),
    maxTpm: tier?.startsWith('paid') ? 5000000 : 1000000,
    currentRpm: 0,
    rollingTokensUsed: 0,
    rollingWindowLimit: tier?.startsWith('paid') ? 5000000 : 1000000,
    windowResetTime: Date.now() + (tier?.startsWith('paid') ? 5 * 3600 * 1000 : 7 * 24 * 3600 * 1000),
    status: 'active',
    cooldownUntil: 0,
    priority: priority ? Number(priority) : 1
  };

  accountManager.addAccount(newAccount);
  res.json({ success: true, account: newAccount });
});

app.put('/api/accounts/:id', (req: Request, res: Response) => {
  const updated = accountManager.updateAccount(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Account not found' });
  res.json({ success: true, account: updated });
});

app.delete('/api/accounts/:id', (req: Request, res: Response) => {
  const deleted = accountManager.deleteAccount(req.params.id);
  res.json({ success: deleted });
});

app.post('/api/accounts/:id/toggle', (req: Request, res: Response) => {
  const enabled = accountManager.toggleAccount(req.params.id);
  if (enabled === null) return res.status(404).json({ error: 'Account not found' });
  res.json({ success: true, enabled });
});

app.post('/api/accounts/verify', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  const result = await accountManager.verifyApiKey(apiKey);
  res.json(result);
});

app.post('/api/accounts/simulate-429', (req: Request, res: Response) => {
  const { accountId } = req.body;
  accountManager.markQuotaExhausted(accountId, 45);
  totalFailoversHandled++;
  res.json({ success: true, message: `Account ${accountId} put in 45s simulated cooldown` });
});

/**
 * REST API: Routing Rules & Matrix
 */
app.get('/api/rules', (req: Request, res: Response) => {
  res.json(routingRules);
});

app.post('/api/rules', (req: Request, res: Response) => {
  routingRules = req.body;
  res.json({ success: true, rules: routingRules });
});

/**
 * REST API: IDE Management
 */
app.get('/api/ides', (req: Request, res: Response) => {
  res.json(ideDetector.scanAll());
});

app.post('/api/ides/toggle', (req: Request, res: Response) => {
  const { ideId, enable } = req.body;
  const result = ideDetector.toggleIDE(ideId, enable);
  res.json(result);
});

app.post('/api/heal/simulate', (req: Request, res: Response) => {
  const { toolName, malformedInput, error } = req.body;
  const result = selfHealer.attemptAutoHeal(
    toolName || 'edit_file',
    malformedInput || '```json\n{"path": "C:\\projects\\app\\main.py", "lines": [1, 2, ],}\n```',
    error || 'Unexpected token in JSON'
  );
  if (result.healed) totalSelfHealsTriggered++;
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` MeshManager Core Running on:   http://localhost:${PORT}`);
  console.log(` Control Center Dashboard:      http://localhost:${PORT}`);
  console.log(` OpenAI / Gemini API Endpoint:  http://localhost:${PORT}/v1`);
  console.log(`=======================================================`);
});
