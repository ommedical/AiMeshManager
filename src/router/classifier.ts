/**
 * Semantic Task Classifier & Dynamic Model Allocator
 * Automatically profiles incoming prompts and allocates tasks
 * to the most appropriate model & account tier based on complexity.
 */

export enum TaskTier {
  TIER_1_MICRO = 'MICRO_SYNTAX',       // Tab Autocomplete, Docstring, Variable Rename, Lint Fix
  TIER_2_TACTICAL = 'TACTICAL_CODE',    // Function generation, Unit Tests, Git Commits, Simple Refactor
  TIER_3_STRATEGIC = 'STRATEGIC_REASON' // Architectural design, Multi-file refactor, Deep Agentic Debugging
}

export interface TaskClassification {
  tier: TaskTier;
  recommendedModel: string;
  preferredAccountTier: 'free' | 'paid_pro';
  confidence: number;
  reason: string;
}

export class SemanticTaskClassifier {
  /**
   * Evaluates prompt text, message depth, and tool schemas to determine task complexity.
   */
  public static classify(messages: Array<{ role: string; content: string }>, tools?: any[]): TaskClassification {
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content.toLowerCase() || '';

    const totalChars = messages.reduce((acc, m) => acc + (m.content ? m.content.length : 0), 0);
    const hasTools = tools && tools.length > 0;

    // 1. Check for Micro / Syntax Tier (High RPM, Low Context)
    const isMicro =
      totalChars < 1200 &&
      (lastUserMessage.includes('complete this') ||
        lastUserMessage.includes('docstring') ||
        lastUserMessage.includes('add comment') ||
        lastUserMessage.includes('rename') ||
        lastUserMessage.includes('format code') ||
        lastUserMessage.includes('fix typo') ||
        lastUserMessage.includes('syntax'));

    if (isMicro) {
      return {
        tier: TaskTier.TIER_1_MICRO,
        recommendedModel: 'gemini-2.5-flash',
        preferredAccountTier: 'free',
        confidence: 0.94,
        reason: 'Short localized syntax/autocomplete task. Routed to Free Gemini Flash for instant sub-second response.'
      };
    }

    // 2. Check for Strategic / Heavy-Duty Agentic Tier
    const isStrategic =
      totalChars > 15000 ||
      (hasTools && tools.length > 8) ||
      lastUserMessage.includes('architect') ||
      lastUserMessage.includes('refactor entire') ||
      lastUserMessage.includes('multi-file') ||
      lastUserMessage.includes('system design') ||
      lastUserMessage.includes('deep analysis') ||
      lastUserMessage.includes('plan and implement');

    if (isStrategic) {
      return {
        tier: TaskTier.TIER_3_STRATEGIC,
        recommendedModel: 'gemini-2.5-pro',
        preferredAccountTier: 'paid_pro',
        confidence: 0.96,
        reason: 'Complex multi-step or high-context task. Allocated to Gemini Pro on Paid Subscription for maximum reasoning capacity.'
      };
    }

    // 3. Default to Tactical Tier
    return {
      tier: TaskTier.TIER_2_TACTICAL,
      recommendedModel: 'gemini-2.5-flash',
      preferredAccountTier: 'free',
      confidence: 0.88,
      reason: 'Standard coding/testing task. Handled cost-effectively via Gemini Flash.'
    };
  }
}
