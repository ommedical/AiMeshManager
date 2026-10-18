/**
 * MeshManager - Multi-Account & Multi-Model Pool Manager
 * Handles persistent storage (~/.meshmanager/accounts.json), default models per account,
 * virtual account/model targeting (e.g. "acc-paid-pro/gemini-2.5-pro"),
 * and active health metrics.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';

export interface GeminiAccount {
  id: string;
  name: string;
  tier: 'free' | 'paid_pro' | 'paid_ultra' | 'enterprise';
  apiKey: string;
  defaultModel: string;
  enabled: boolean;
  maxRpm: number;
  maxTpm: number;
  currentRpm: number;
  rollingTokensUsed: number;
  rollingWindowLimit: number;
  windowResetTime: number;
  status: 'active' | 'cooldown' | 'exhausted' | 'disabled';
  cooldownUntil: number;
  priority: number;
}

export class AccountPoolManager {
  private configDir = path.join(os.homedir(), '.meshmanager');
  private accountsFile = path.join(this.configDir, 'accounts.json');
  private accounts: Map<string, GeminiAccount> = new Map();

  constructor() {
    this.ensureConfigDir();
    this.loadAccounts();

    // Periodic maintenance cycle (unreferenced so CLI does not hang)
    const timer = setInterval(() => this.maintenanceCycle(), 10000);
    if (timer.unref) timer.unref();
  }

  private ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  private loadAccounts() {
    if (fs.existsSync(this.accountsFile)) {
      try {
        const raw = fs.readFileSync(this.accountsFile, 'utf-8');
        const data: GeminiAccount[] = JSON.parse(raw);
        data.forEach(acc => this.accounts.set(acc.id, acc));
        return;
      } catch (e) {
        console.error('[MeshManager] Failed to parse accounts.json; falling back to default seed.');
      }
    }

    this.initializeDefaultSeed();
    this.saveAccounts();
  }

  public saveAccounts() {
    try {
      const data = Array.from(this.accounts.values());
      fs.writeFileSync(this.accountsFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e: any) {
      console.error(`[MeshManager] Failed to persist accounts: ${e.message}`);
    }
  }

  private initializeDefaultSeed() {
    const demoFree1: GeminiAccount = {
      id: 'acc-free-1',
      name: 'Gemini Free Account (Primary)',
      tier: 'free',
      apiKey: process.env.GEMINI_KEY_FREE_1 || 'DEMO_FREE_KEY_1',
      defaultModel: 'gemini-2.5-flash',
      enabled: true,
      maxRpm: 15,
      maxTpm: 1000000,
      currentRpm: 0,
      rollingTokensUsed: 120000,
      rollingWindowLimit: 1000000,
      windowResetTime: Date.now() + 7 * 24 * 3600 * 1000,
      status: 'active',
      cooldownUntil: 0,
      priority: 1
    };

    const demoFree2: GeminiAccount = {
      id: 'acc-free-2',
      name: 'Gemini Free Account (Secondary)',
      tier: 'free',
      apiKey: process.env.GEMINI_KEY_FREE_2 || 'DEMO_FREE_KEY_2',
      defaultModel: 'gemini-2.5-flash',
      enabled: true,
      maxRpm: 15,
      maxTpm: 1000000,
      currentRpm: 0,
      rollingTokensUsed: 45000,
      rollingWindowLimit: 1000000,
      windowResetTime: Date.now() + 5 * 24 * 3600 * 1000,
      status: 'active',
      cooldownUntil: 0,
      priority: 2
    };

    const demoPaidPro: GeminiAccount = {
      id: 'acc-paid-pro',
      name: 'Google AI Pro (5h Rolling Bucket)',
      tier: 'paid_pro',
      apiKey: process.env.GEMINI_KEY_PAID || 'DEMO_PAID_KEY',
      defaultModel: 'gemini-2.5-pro',
      enabled: true,
      maxRpm: 120,
      maxTpm: 5000000,
      currentRpm: 0,
      rollingTokensUsed: 890000,
      rollingWindowLimit: 5000000,
      windowResetTime: Date.now() + 3.5 * 3600 * 1000,
      status: 'active',
      cooldownUntil: 0,
      priority: 3
    };

    this.accounts.set(demoFree1.id, demoFree1);
    this.accounts.set(demoFree2.id, demoFree2);
    this.accounts.set(demoPaidPro.id, demoPaidPro);
  }

  public getAccounts(): GeminiAccount[] {
    return Array.from(this.accounts.values());
  }

  public getAccount(id: string): GeminiAccount | undefined {
    return this.accounts.get(id);
  }

  public addAccount(account: GeminiAccount) {
    this.accounts.set(account.id, account);
    this.saveAccounts();
  }

  public updateAccount(id: string, updates: Partial<GeminiAccount>): GeminiAccount | null {
    const existing = this.accounts.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.accounts.set(id, updated);
    this.saveAccounts();
    return updated;
  }

  public deleteAccount(id: string): boolean {
    const deleted = this.accounts.delete(id);
    if (deleted) this.saveAccounts();
    return deleted;
  }

  public toggleAccount(id: string): boolean | null {
    const acc = this.accounts.get(id);
    if (!acc) return null;
    acc.enabled = !acc.enabled;
    acc.status = acc.enabled ? 'active' : 'disabled';
    this.saveAccounts();
    return acc.enabled;
  }

  /**
   * Resolves target account and model.
   * Supports virtual targeting syntax: "accountId/modelName" (e.g. "acc-paid-pro/gemini-2.5-pro")
   */
  public resolveTarget(
    requestedModel: string,
    preferredTier?: 'free' | 'paid_pro' | 'paid_ultra'
  ): { targetAccount: GeminiAccount | null; targetModel: string; isExplicitPin: boolean } {
    // 1. Virtual account pin: "accountId/modelName"
    if (requestedModel.includes('/')) {
      const parts = requestedModel.split('/');
      const accId = parts[0];
      const modelName = parts.slice(1).join('/');

      const pinnedAcc = this.accounts.get(accId);
      if (pinnedAcc && pinnedAcc.enabled) {
        return {
          targetAccount: pinnedAcc,
          targetModel: modelName || pinnedAcc.defaultModel,
          isExplicitPin: true
        };
      }
    }

    // 2. Dynamic P2C selection
    const candidate = this.selectBestAccount(preferredTier);
    if (!candidate) {
      return { targetAccount: null, targetModel: requestedModel, isExplicitPin: false };
    }

    // Default to account's default model if model was "auto-smart-router" or empty
    const resolvedModel =
      !requestedModel || requestedModel === 'auto-smart-router'
        ? candidate.defaultModel
        : requestedModel;

    return {
      targetAccount: candidate,
      targetModel: resolvedModel,
      isExplicitPin: false
    };
  }

  public selectBestAccount(preferredTier?: string): GeminiAccount | null {
    const candidates = Array.from(this.accounts.values()).filter(
      acc => acc.enabled && acc.status === 'active' && acc.currentRpm < acc.maxRpm
    );

    if (candidates.length === 0) return null;

    let filtered = candidates;
    if (preferredTier) {
      const tierMatches = candidates.filter(acc => acc.tier === preferredTier);
      if (tierMatches.length > 0) filtered = tierMatches;
    }

    if (filtered.length === 1) return filtered[0];

    // P2C (Power of Two Choices) based on remaining headroom
    const idx1 = Math.floor(Math.random() * filtered.length);
    let idx2 = Math.floor(Math.random() * filtered.length);
    while (idx2 === idx1 && filtered.length > 1) {
      idx2 = Math.floor(Math.random() * filtered.length);
    }

    const acc1 = filtered[idx1];
    const acc2 = filtered[idx2];
    const headroom1 = acc1.rollingWindowLimit - acc1.rollingTokensUsed;
    const headroom2 = acc2.rollingWindowLimit - acc2.rollingTokensUsed;

    return headroom1 >= headroom2 ? acc1 : acc2;
  }

  public markQuotaExhausted(accountId: string, cooldownDurationSec: number = 60) {
    const acc = this.accounts.get(accountId);
    if (acc) {
      acc.status = 'cooldown';
      acc.cooldownUntil = Date.now() + cooldownDurationSec * 1000;
      this.saveAccounts();
    }
  }

  public recordConsumption(accountId: string, tokensUsed: number) {
    const acc = this.accounts.get(accountId);
    if (acc) {
      acc.rollingTokensUsed += tokensUsed;
      acc.currentRpm += 1;
      setTimeout(() => {
        if (acc.currentRpm > 0) acc.currentRpm -= 1;
      }, 60000);
      this.saveAccounts();
    }
  }

  /**
   * Validates a Gemini API Key against Google's Generative Language API
   */
  public async verifyApiKey(apiKey: string): Promise<{ valid: boolean; message: string; models?: string[] }> {
    if (!apiKey || apiKey.startsWith('DEMO_')) {
      return { valid: true, message: 'Demo API Key accepted (Mock Mode).' };
    }

    return new Promise(resolve => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      https
        .get(url, res => {
          let body = '';
          res.on('data', chunk => (body += chunk));
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const parsed = JSON.parse(body);
                const models = (parsed.models || []).map((m: any) => m.name.replace('models/', ''));
                resolve({ valid: true, message: 'API Key successfully verified with Google Gemini API!', models });
              } catch (e) {
                resolve({ valid: true, message: 'API Key authenticated successfully.' });
              }
            } else {
              resolve({ valid: false, message: `Authentication failed (HTTP ${res.statusCode}). Please check your API key.` });
            }
          });
        })
        .on('error', err => {
          resolve({ valid: false, message: `Network error verifying key: ${err.message}` });
        });
    });
  }

  private maintenanceCycle() {
    const now = Date.now();
    let changed = false;

    for (const acc of this.accounts.values()) {
      if (acc.status === 'cooldown' && now >= acc.cooldownUntil) {
        acc.status = acc.enabled ? 'active' : 'disabled';
        acc.cooldownUntil = 0;
        changed = true;
      }

      if (now >= acc.windowResetTime) {
        acc.rollingTokensUsed = 0;
        const refillDuration = acc.tier.startsWith('paid') ? 5 * 3600 * 1000 : 7 * 24 * 3600 * 1000;
        acc.windowResetTime = now + refillDuration;
        acc.status = acc.enabled ? 'active' : 'disabled';
        changed = true;
      }
    }

    if (changed) this.saveAccounts();
  }
}
