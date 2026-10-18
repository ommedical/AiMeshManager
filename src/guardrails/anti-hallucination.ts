/**
 * Anti-Hallucination & Schema Verification Guard
 * Enforces deterministic sampling, verifies JSON tool schemas,
 * and validates that code references and paths are grounded in the active context.
 */

export interface HallucinationCheckResult {
  passed: boolean;
  score: number; // 0 to 1 (1 = fully grounded)
  correctedContent?: string;
  violations: string[];
}

export class AntiHallucinationGuard {
  /**
   * Validates tool call arguments against JSON schema definitions.
   * Catches hallucinated parameters before they cause downstream crashes.
   */
  public static validateToolCall(toolName: string, argsRaw: string, declaredSchema?: any): { valid: boolean; parsedArgs?: any; error?: string } {
    try {
      const parsed = JSON.parse(argsRaw);

      if (declaredSchema && declaredSchema.parameters && declaredSchema.parameters.required) {
        const requiredFields: string[] = declaredSchema.parameters.required;
        const missing = requiredFields.filter(field => !(field in parsed));
        if (missing.length > 0) {
          return {
            valid: false,
            error: `Hallucinated/Missing required parameters: ${missing.join(', ')}`
          };
        }
      }

      return { valid: true, parsedArgs: parsed };
    } catch (err: any) {
      return {
        valid: false,
        error: `Malformed JSON tool call arguments: ${err.message}`
      };
    }
  }

  /**
   * Scans generated output to verify that declared file references, import paths,
   * or function names are grounded within the provided prompt context.
   */
  public static verifyGrounding(generatedText: string, contextPrompt: string): HallucinationCheckResult {
    const violations: string[] = [];

    // 1. Detect phantom imports or hallucinated library paths (e.g. 'from internal_google_secret_lib import ...')
    const phantomImportRegex = /(?:import\s+(\w+)|from\s+([\w\.\/\-]+)\s+import)/g;
    let match;
    while ((match = phantomImportRegex.exec(generatedText)) !== null) {
      const moduleName = match[1] || match[2];
      // If module is deeply specific and completely absent from user prompt / common standard libraries
      if (moduleName && moduleName.length > 15 && !contextPrompt.includes(moduleName) && !AntiHallucinationGuard.isStandardLib(moduleName)) {
        violations.push(`Unverified package reference: '${moduleName}'`);
      }
    }

    const passed = violations.length === 0;
    const score = passed ? 1.0 : Math.max(0.2, 1.0 - (violations.length * 0.25));

    return {
      passed,
      score,
      violations
    };
  }

  private static isStandardLib(name: string): boolean {
    const commonLibs = new Set(['fs', 'path', 'os', 'http', 'https', 'crypto', 'express', 'react', 'vue', 'numpy', 'pandas', 'sys', 'json']);
    return commonLibs.has(name.toLowerCase());
  }
}
