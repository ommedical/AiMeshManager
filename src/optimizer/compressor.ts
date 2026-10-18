/**
 * Token Compressor & Context Optimizer
 * Strips whitespace bloat, deduplicates file chunks, and manages semantic prompt cache.
 */

import * as crypto from 'crypto';

export interface OptimizationResult {
  optimizedMessages: Array<{ role: string; content: string }>;
  originalTokensEstimate: number;
  optimizedTokensEstimate: number;
  tokensSaved: number;
  compressionRatio: number;
}

export class TokenOptimizer {
  private cache: Map<string, { response: any; timestamp: number }> = new Map();
  private totalTokensSaved: number = 0;

  /**
   * Estimates token count based on standard character-to-token ratio (~4 chars per token)
   */
  public estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Compresses whitespace, repetitive line breaks, and prunes boilerplate comments.
   */
  public optimize(messages: Array<{ role: string; content: string }>): OptimizationResult {
    let originalChars = 0;
    let optimizedChars = 0;

    const optimized = messages.map(m => {
      const original = m.content || '';
      originalChars += original.length;

      // 1. Collapse multiple empty newlines into a single newline
      let clean = original.replace(/\n\s*\n\s*\n/g, '\n\n');

      // 2. Trim trailing spaces on each line
      clean = clean.replace(/[ \t]+$/gm, '');

      // 3. Remove verbose ASCII box borders from IDE diagnostic attachments if present
      clean = clean.replace(/[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬]+/g, ' ');

      optimizedChars += clean.length;
      return {
        role: m.role,
        content: clean
      };
    });

    const origTokens = Math.ceil(originalChars / 4);
    const optTokens = Math.ceil(optimizedChars / 4);
    const saved = Math.max(0, origTokens - optTokens);

    this.totalTokensSaved += saved;

    return {
      optimizedMessages: optimized,
      originalTokensEstimate: origTokens,
      optimizedTokensEstimate: optTokens,
      tokensSaved: saved,
      compressionRatio: origTokens > 0 ? Number(((origTokens - optTokens) / origTokens * 100).toFixed(1)) : 0
    };
  }

  public getCacheKey(messages: Array<{ role: string; content: string }>): string {
    const raw = JSON.stringify(messages);
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  public checkCache(cacheKey: string): any | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    // Cache TTL: 30 minutes
    if (Date.now() - entry.timestamp > 30 * 60 * 1000) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.response;
  }

  public setCache(cacheKey: string, response: any) {
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  public getTotalTokensSaved(): number {
    return this.totalTokensSaved;
  }
}
