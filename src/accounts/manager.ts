/**
 * Multi-Account Pool & Quota Manager
 * Supports Free Consumer Gemini accounts and Paid (Pro/Ultra) Subscriptions.
 * Handles 5-hour rolling refill windows, weekly limits, and auto-failovers.
 */

export interface GeminiAccount {
  id: string;
  name: string;
  tier: 'free' | 'paid_pro' | 'paid_ultra';
  apiKey: string;
  maxRpm: number;
  maxTpm: number;
  currentRpm: number;
  rollingTokensUsed: number;
  rollingWindowLimit: number; // 5-hour limit for paid, weekly for free
  windowResetTime: number; // Unix timestamp in ms
  status: 'active' | 'cooldown' | 'exhausted';
  cooldownUntil: number;
  priority: number;
}

export class AccountPoolManager {
  private accounts: Map<string, GeminiAccount> = new Map();
  private defaultAccountId: string | null = null;

  constructor() {
    this.initializeDefaultAccounts();
    // Schedule periodic quota refresh / cooldown checks every 10 seconds (unref so CLI exits cleanly)
    const timer = setInterval(() => this.maintenanceCycle(), 10000);
    if (timer.unref) {
      timer.unref();
    }
  }

  private initializeDefaultAccounts() {
    // Seed with initial template configuration (user can add more via UI)
    const demoFree1: GeminiAccount = {
      id: 'acc-free-1',
      name: 'Gemini Free Account (Primary)',
      tier: 'free',
      apiKey: process.env.GEMINI_KEY_FREE_1 || 'DEMO_FREE_KEY_1',
      maxRpm: 15,
      maxTpm: 1000000,
      currentRpm: 0,
      rollingTokensUsed: 120000,
      rollingWindowLimit: 1000000,
      windowResetTime: Date.now() + 7 * 24 * 3600 * 1000, // 7 days
      status: 'active',
      cooldownUntil: 0,
      priority: 1
    };

    const demoFree2: GeminiAccount = {
      id: 'acc-free-2',
      name: 'Gemini Free Account (Secondary)',
      tier: 'free',
      apiKey: process.env.GEMINI_KEY_FREE_2 || 'DEMO_FREE_KEY_2',
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
      maxRpm: 120,
      maxTpm: 5000000,
      currentRpm: 0,
      rollingTokensUsed: 890000,
      rollingWindowLimit: 5000000,
      windowResetTime: Date.now() + 3.5 * 3600 * 1000, // 3.5 hours remaining in rolling cycle
      status: 'active',
      cooldownUntil: 0,
      priority: 3
    };

    this.addAccount(demoFree1);
    this.addAccount(demoFree2);
    this.addAccount(demoPaidPro);
  }

  public addAccount(account: GeminiAccount) {
    this.accounts.set(account.id, account);
    if (!this.defaultAccountId) {
      this.defaultAccountId = account.id;
    }
  }

  public getAccounts(): GeminiAccount[] {
    return Array.from(this.accounts.values());
  }

  public getAccount(id: string): GeminiAccount | undefined {
    return this.accounts.get(id);
  }

  /**
   * Selects the optimal account using Quota-Aware Power-of-Two-Choices (P2C)
   * matching the requested tier requirement (free vs paid).
   */
  public selectBestAccount(preferredTier?: 'free' | 'paid_pro' | 'paid_ultra'): GeminiAccount | null {
    const candidates = Array.from(this.accounts.values()).filter(
      acc => acc.status === 'active' && acc.currentRpm < acc.maxRpm
    );

    if (candidates.length === 0) {
      return null;
    }

    // Filter by preferred tier if available
    let filtered = candidates;
    if (preferredTier) {
      const tierMatches = candidates.filter(acc => acc.tier === preferredTier);
      if (tierMatches.length > 0) {
        filtered = tierMatches;
      }
    }

    if (filtered.length === 1) {
      return filtered[0];
    }

    // Power of Two Choices (P2C) algorithm based on remaining headroom
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

  /**
   * Triggered when an account hits HTTP 429 RateLimit or ResourceExhausted
   */
  public markQuotaExhausted(accountId: string, cooldownDurationSec: number = 60) {
    const acc = this.accounts.get(accountId);
    if (acc) {
      acc.status = 'cooldown';
      acc.cooldownUntil = Date.now() + cooldownDurationSec * 1000;
      console.log(`[AccountPool] Account '${acc.name}' marked cooldown until ${new Date(acc.cooldownUntil).toISOString()}`);
    }
  }

  /**
   * Records token consumption after a turn finishes
   */
  public recordConsumption(accountId: string, tokensUsed: number) {
    const acc = this.accounts.get(accountId);
    if (acc) {
      acc.rollingTokensUsed += tokensUsed;
      acc.currentRpm += 1;
      // Decrement RPM after 1 minute
      setTimeout(() => {
        if (acc.currentRpm > 0) acc.currentRpm -= 1;
      }, 60000);
    }
  }

  private maintenanceCycle() {
    const now = Date.now();
    for (const acc of this.accounts.values()) {
      // Release from cooldown if time expired
      if (acc.status === 'cooldown' && now >= acc.cooldownUntil) {
        acc.status = 'active';
        acc.cooldownUntil = 0;
        console.log(`[AccountPool] Cooldown expired. Account '${acc.name}' reactivated.`);
      }

      // Reset rolling window if reset time reached
      if (now >= acc.windowResetTime) {
        acc.rollingTokensUsed = 0;
        const refillDuration = acc.tier.startsWith('paid') ? 5 * 3600 * 1000 : 7 * 24 * 3600 * 1000;
        acc.windowResetTime = now + refillDuration;
        acc.status = 'active';
        console.log(`[AccountPool] Rolling quota window reset for '${acc.name}'. Full capacity restored.`);
      }
    }
  }
}
