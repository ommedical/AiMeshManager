/**
 * Self-Healing Reflection & Adaptive Error Recovery Engine
 * Inspired by Nous Research Hermes-Agent Reflexion & Persistent Memory loops.
 * Catches tool call failures, reflects on execution errors, and synthesizes self-corrections.
 */

export interface ErrorReflectionRecord {
  id: string;
  timestamp: number;
  triggerPromptSnippet: string;
  errorType: string;
  errorMessage: string;
  remedyApplied: string;
  resolved: boolean;
}

export class SelfHealingEngine {
  private memoryRecords: ErrorReflectionRecord[] = [];
  private learnedRules: Set<string> = new Set();

  constructor() {
    this.seedBaselineHeuristics();
  }

  private seedBaselineHeuristics() {
    this.learnedRules.add("Ensure all JSON tool arguments escape backslashes in Windows file paths.");
    this.learnedRules.add("Do not emit trailing commas in tool call argument JSON objects.");
    this.learnedRules.add("Omit non-standard markdown formatting when generating strict JSON outputs.");
  }

  /**
   * Evaluates a failed tool execution or schema parse failure and synthesizes an auto-repair.
   */
  public attemptAutoHeal(
    toolName: string,
    malformedInput: string,
    originalError: string
  ): { healed: boolean; correctedInput?: string; reflectionNote: string } {
    console.log(`[Self-Healer] Intercepted execution failure for '${toolName}': ${originalError}`);

    let fixed = malformedInput;

    // 1. Fix: Windows path unescaped backslashes (common hallucination in agent tool calls)
    if (fixed.includes('\\') && !fixed.includes('\\\\')) {
      fixed = fixed.replace(/([^\\])\\([^\\])/g, '$1\\\\$2');
    }

    // 2. Fix: Markdown code block fences wrapped around JSON string
    if (fixed.startsWith('```json') || fixed.startsWith('```')) {
      fixed = fixed.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }

    // 3. Fix: Trailing commas in JSON objects / arrays
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');

    // Test parse
    try {
      JSON.parse(fixed);
      const record: ErrorReflectionRecord = {
        id: `heal-${Date.now()}`,
        timestamp: Date.now(),
        triggerPromptSnippet: malformedInput.slice(0, 80),
        errorType: 'JSON_SYNTAX_ERROR',
        errorMessage: originalError,
        remedyApplied: 'Sanitized backslashes, stripped markdown code fences and trailing commas',
        resolved: true
      };
      this.memoryRecords.push(record);

      return {
        healed: true,
        correctedInput: fixed,
        reflectionNote: `Auto-repaired malformed payload for tool '${toolName}'. Preserved session without crashing IDE.`
      };
    } catch (recheckErr: any) {
      return {
        healed: false,
        reflectionNote: `Unrecoverable error in tool call: ${recheckErr.message}`
      };
    }
  }

  /**
   * Injects synthesized memory insights into outgoing system instructions to prevent repeat mistakes.
   */
  public getReflectiveSystemContext(): string {
    if (this.learnedRules.size === 0) return '';
    const rulesList = Array.from(this.learnedRules).map(r => `• ${r}`).join('\n');
    return `\n[Agent Self-Healing Memory Guidelines]\n${rulesList}\n`;
  }

  public getHistory(): ErrorReflectionRecord[] {
    return this.memoryRecords;
  }
}
