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
  heatScore: number; // 0-100 percentage heat metric
  intelligenceLevel: number; // 1-5 required reasoning power
  category: 'Micro Syntax' | 'Tactical Code' | 'Brainstorming & Planning' | 'Strategic Architecture';
}

export class SemanticTaskClassifier {
  /**
   * Evaluates prompt text, message depth, and tool schemas to determine task complexity,
   * heat level, and required reasoning power.
   */
  public static classify(messages: Array<{ role: string; content: string }>, tools?: any[]): TaskClassification {
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content.toLowerCase() || '';

    const totalChars = messages.reduce((acc, m) => acc + (m.content ? m.content.length : 0), 0);
    const hasTools = tools && tools.length > 0;

    // 1. Check for Micro / Syntax Tier (High RPM, Low Context, Heat: 15-25%)
    const isMicro =
      totalChars < 1200 &&
      (lastUserMessage.includes('complete this') ||
        lastUserMessage.includes('docstring') ||
        lastUserMessage.includes('add comment') ||
        lastUserMessage.includes('rename') ||
        lastUserMessage.includes('format code') ||
        lastUserMessage.includes('fix typo') ||
        lastUserMessage.includes('syntax') ||
        lastUserMessage.includes('lint'));

    if (isMicro) {
      return {
        tier: TaskTier.TIER_1_MICRO,
        recommendedModel: 'gemini-2.5-flash',
        preferredAccountTier: 'free',
        confidence: 0.94,
        heatScore: 20,
        intelligenceLevel: 1,
        category: 'Micro Syntax',
        reason: 'Short localized syntax/autocomplete task. Routed to Free Gemini Flash for instant sub-second response.'
      };
    }

    // 2. Check for Brainstorming & High-Level Architectural Design (Heat: 80-100%)
    const isBrainstormOrPlan =
      lastUserMessage.includes('brainstorm') ||
      lastUserMessage.includes('plan and design') ||
      lastUserMessage.includes('roadmap') ||
      lastUserMessage.includes('tradeoff') ||
      lastUserMessage.includes('evaluate alternatives');

    const isStrategic =
      isBrainstormOrPlan ||
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
        heatScore: isBrainstormOrPlan ? 88 : 96,
        intelligenceLevel: 5,
        category: isBrainstormOrPlan ? 'Brainstorming & Planning' : 'Strategic Architecture',
        reason: 'Complex multi-step or high-context reasoning task. Allocated to Gemini Pro on Paid Subscription for maximum intelligence.'
      };
    }

    // 3. Default to Tactical Tier (Heat: 50-60%, Intelligence: 3)
    return {
      tier: TaskTier.TIER_2_TACTICAL,
      recommendedModel: 'gemini-2.5-flash',
      preferredAccountTier: 'free',
      confidence: 0.88,
      heatScore: 55,
      intelligenceLevel: 3,
      category: 'Tactical Code',
      reason: 'Standard coding/testing task. Handled cost-effectively via Gemini Flash.'
    };
  }
}
