/**
 * AiMeshManager - Dynamic Model Knowledge & Performance Registry
 * 
 * Provides:
 * 1. Comprehensive multi-provider intelligence ranking & performance catalog
 *    (Gemini, OpenAI, Anthropic Claude, DeepSeek, OpenRouter/Free, Vertex)
 * 2. Full native discovery and integration for locally running models:
 *    - Ollama (http://127.0.0.1:11434)
 *    - LM Studio (http://127.0.0.1:1234)
 *    - vLLM / LocalAI / llama.cpp (http://127.0.0.1:8000)
 * 3. Dynamic Model Discovery & Live Capability Mapping
 */

import * as http from 'http';
import * as https from 'https';
import { ProviderType } from '../accounts/manager';
import { TaskTier } from '../router/classifier';

export interface ModelCapability {
  id: string;
  name: string;
  provider: ProviderType;
  tier: TaskTier;
  intelligenceLevel: number; // 1 to 5
  recommendedHeatMin: number; // 0 to 100
  recommendedHeatMax: number;
  contextWindow: number;
  costProfile: 'free_local' | 'free_cloud' | 'paid_pro' | 'paid_ultra';
  isLocal: boolean;
  bestFor: string;
  description: string;
}

export interface LocalServerStatus {
  service: 'ollama' | 'lmstudio' | 'vllm' | 'custom_local';
  name: string;
  endpoint: string;
  isOnline: boolean;
  models: string[];
  latencyMs?: number;
}

export class ModelKnowledgeRegistry {
  private static knowledgeCatalog: Map<string, ModelCapability> = new Map();

  static {
    // ==========================================
    // 🧠 Google Gemini Models
    // ==========================================
    this.register({
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'gemini',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 75,
      recommendedHeatMax: 100,
      contextWindow: 2000000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Multi-file architecture, distributed system design, complex refactoring',
      description: 'Google top-tier reasoning and coding model with massive 2M context window.'
    });

    this.register({
      id: 'gemini-2.0-flash-thinking',
      name: 'Gemini 2.0 Flash Thinking',
      provider: 'gemini',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 4,
      recommendedHeatMin: 65,
      recommendedHeatMax: 90,
      contextWindow: 1000000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Deep mathematical logic, debugging edge cases, algorithmic design',
      description: 'Specialized reasoning model with visible internal chain-of-thought.'
    });

    this.register({
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      tier: TaskTier.TIER_2_TACTICAL,
      intelligenceLevel: 3,
      recommendedHeatMin: 30,
      recommendedHeatMax: 75,
      contextWindow: 1000000,
      costProfile: 'free_cloud',
      isLocal: false,
      bestFor: 'Feature implementation, unit tests, fast code generation',
      description: 'High-speed, high-throughput model ideal for general coding tasks.'
    });

    this.register({
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      tier: TaskTier.TIER_1_MICRO,
      intelligenceLevel: 2,
      recommendedHeatMin: 0,
      recommendedHeatMax: 40,
      contextWindow: 1000000,
      costProfile: 'free_cloud',
      isLocal: false,
      bestFor: 'Docstrings, linting, syntax completion, inline edits',
      description: 'Sub-second latency model with generous free RPM quota.'
    });

    // ==========================================
    // 🧠 OpenAI Models
    // ==========================================
    this.register({
      id: 'o1',
      name: 'OpenAI o1',
      provider: 'openai',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 85,
      recommendedHeatMax: 100,
      contextWindow: 200000,
      costProfile: 'paid_ultra',
      isLocal: false,
      bestFor: 'Competitive coding, complex architectural verification, formal logic',
      description: 'SOTA reasoning model using reinforcement learning for deep reflection.'
    });

    this.register({
      id: 'o3-mini',
      name: 'OpenAI o3-mini',
      provider: 'openai',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 70,
      recommendedHeatMax: 95,
      contextWindow: 200000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'High-speed reasoning, multi-turn coding debates, architectural planning',
      description: 'Efficient reasoning model offering high intelligence at low cost.'
    });

    this.register({
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 65,
      recommendedHeatMax: 90,
      contextWindow: 128000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Full-stack development, agentic workflows, multi-modal tasks',
      description: 'Omni-modal flagship model with strong general coding capability.'
    });

    this.register({
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      tier: TaskTier.TIER_2_TACTICAL,
      intelligenceLevel: 3,
      recommendedHeatMin: 25,
      recommendedHeatMax: 70,
      contextWindow: 128000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Rapid iterative coding, test suite generation, script drafting',
      description: 'Ultra-fast, cost-effective mini model for everyday coding turns.'
    });

    // ==========================================
    // 🧠 Anthropic Claude Models
    // ==========================================
    this.register({
      id: 'claude-3-7-sonnet',
      name: 'Claude 3.7 Sonnet (Thinking)',
      provider: 'anthropic',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 80,
      recommendedHeatMax: 100,
      contextWindow: 200000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Complex full-codebase refactoring, agentic exploration, architecture',
      description: 'Hybrid reasoning model capable of dynamic thinking budget allocation.'
    });

    this.register({
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 70,
      recommendedHeatMax: 95,
      contextWindow: 200000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Software engineering, Git diff synthesis, multi-file code editing',
      description: 'Widely recognized industry standard for agentic software engineering.'
    });

    this.register({
      id: 'claude-3-5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      tier: TaskTier.TIER_2_TACTICAL,
      intelligenceLevel: 3,
      recommendedHeatMin: 20,
      recommendedHeatMax: 65,
      contextWindow: 200000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Sub-second coding responses, fast function writing, lint auto-fixes',
      description: 'Instant response tactical model rivaling previous generation flagships.'
    });

    // ==========================================
    // 🧠 DeepSeek Models
    // ==========================================
    this.register({
      id: 'deepseek-reasoner',
      name: 'DeepSeek-R1 (Reasoner)',
      provider: 'deepseek',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 75,
      recommendedHeatMax: 100,
      contextWindow: 64000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Mathematical proofs, algorithmic optimization, deep code reasoning',
      description: 'Open-weights reasoning model matching frontier model performance.'
    });

    this.register({
      id: 'deepseek-chat',
      name: 'DeepSeek-V3',
      provider: 'deepseek',
      tier: TaskTier.TIER_2_TACTICAL,
      intelligenceLevel: 4,
      recommendedHeatMin: 40,
      recommendedHeatMax: 80,
      contextWindow: 64000,
      costProfile: 'free_cloud',
      isLocal: false,
      bestFor: 'General software engineering, API integration, code review',
      description: '671B parameter Mixture-of-Experts model with high performance.'
    });

    // ==========================================
    // 🧠 Meta Llama & OpenRouter Frontier Models
    // ==========================================
    this.register({
      id: 'meta-llama/llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B Instruct (Meta / OpenRouter)',
      provider: 'meta',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 70,
      recommendedHeatMax: 95,
      contextWindow: 128000,
      costProfile: 'free_cloud',
      isLocal: false,
      bestFor: 'Deep coding reasoning, multi-language refactoring, agent workflows',
      description: 'Meta flagship open-weights model matching GPT-4o performance on coding benchmarks.'
    });

    this.register({
      id: 'meta-llama/llama-3.1-405b-instruct',
      name: 'Llama 3.1 405B Instruct (Meta Frontier)',
      provider: 'meta',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 85,
      recommendedHeatMax: 100,
      contextWindow: 128000,
      costProfile: 'paid_ultra',
      isLocal: false,
      bestFor: 'Grand architectural design, formal code verification, complex agent planning',
      description: 'Meta largest 405B parameter frontier model with maximum reasoning depth.'
    });

    this.register({
      id: 'deepseek/deepseek-r1:free',
      name: 'DeepSeek-R1 (OpenRouter Free Tier)',
      provider: 'openrouter',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 70,
      recommendedHeatMax: 100,
      contextWindow: 64000,
      costProfile: 'free_cloud',
      isLocal: false,
      bestFor: '100% free cloud reasoning turn via OpenRouter free pool',
      description: 'Zero-cost frontier reasoning model available via OpenRouter.'
    });

    this.register({
      id: 'meta-llama/llama-3.3-70b-instruct:free',
      name: 'Llama 3.3 70B (OpenRouter Free Tier)',
      provider: 'openrouter',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 4,
      recommendedHeatMin: 60,
      recommendedHeatMax: 90,
      contextWindow: 128000,
      costProfile: 'free_cloud',
      isLocal: false,
      bestFor: 'High-speed free cloud code generation via OpenRouter',
      description: 'Zero-cost 70B parameter model hosted on OpenRouter free tier.'
    });

    this.register({
      id: 'openrouter/auto',
      name: 'OpenRouter Auto (Best Available)',
      provider: 'openrouter',
      tier: TaskTier.TIER_2_TACTICAL,
      intelligenceLevel: 4,
      recommendedHeatMin: 30,
      recommendedHeatMax: 80,
      contextWindow: 128000,
      costProfile: 'paid_pro',
      isLocal: false,
      bestFor: 'Automated lowest-cost / highest-throughput routing across providers',
      description: 'OpenRouter dynamic auto-router that dispatches to optimal provider.'
    });

    // ==========================================
    // 💻 Locally Running Models (Ollama, LM Studio, vLLM)
    // ==========================================
    this.register({
      id: 'qwen2.5-coder:32b',
      name: 'Qwen 2.5 Coder 32B (Local)',
      provider: 'ollama',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 5,
      recommendedHeatMin: 70,
      recommendedHeatMax: 95,
      contextWindow: 128000,
      costProfile: 'free_local',
      isLocal: true,
      bestFor: 'Local private architecture, offline coding, complex refactoring',
      description: 'State-of-the-art open code model running completely private on local GPU/RAM.'
    });

    this.register({
      id: 'qwen2.5-coder:14b',
      name: 'Qwen 2.5 Coder 14B (Local)',
      provider: 'ollama',
      tier: TaskTier.TIER_2_TACTICAL,
      intelligenceLevel: 4,
      recommendedHeatMin: 45,
      recommendedHeatMax: 80,
      contextWindow: 64000,
      costProfile: 'free_local',
      isLocal: true,
      bestFor: 'Offline feature generation, unit tests, fast local code reasoning',
      description: 'High-speed local coding model suitable for 16GB+ VRAM/RAM hardware.'
    });

    this.register({
      id: 'qwen2.5-coder:7b',
      name: 'Qwen 2.5 Coder 7B (Local)',
      provider: 'ollama',
      tier: TaskTier.TIER_2_TACTICAL,
      intelligenceLevel: 3,
      recommendedHeatMin: 20,
      recommendedHeatMax: 65,
      contextWindow: 32000,
      costProfile: 'free_local',
      isLocal: true,
      bestFor: 'Fast local completions, lightweight scripting, laptop GPU friendly',
      description: 'Efficient local model that runs smoothly on standard laptops and 8GB VRAM.'
    });

    this.register({
      id: 'deepseek-r1:7b',
      name: 'DeepSeek-R1 Distill 7B (Local)',
      provider: 'ollama',
      tier: TaskTier.TIER_3_STRATEGIC,
      intelligenceLevel: 4,
      recommendedHeatMin: 60,
      recommendedHeatMax: 85,
      contextWindow: 32000,
      costProfile: 'free_local',
      isLocal: true,
      bestFor: 'Local chain-of-thought reasoning, offline problem solving',
      description: 'Distilled reasoning model that runs locally with chain-of-thought reasoning.'
    });

    this.register({
      id: 'llama3.2:3b',
      name: 'Llama 3.2 3B (Local Instant)',
      provider: 'ollama',
      tier: TaskTier.TIER_1_MICRO,
      intelligenceLevel: 2,
      recommendedHeatMin: 0,
      recommendedHeatMax: 35,
      contextWindow: 32000,
      costProfile: 'free_local',
      isLocal: true,
      bestFor: 'Sub-second tab autocomplete, variable renaming, syntax formatting',
      description: 'Ultra-lightweight local model running at 80+ tokens/sec on modern CPUs.'
    });
  }

  private static register(model: ModelCapability) {
    this.knowledgeCatalog.set(model.id.toLowerCase(), model);
  }

  /**
   * Retrieves all known models in the knowledge catalog.
   */
  public static getAllModels(): ModelCapability[] {
    return Array.from(this.knowledgeCatalog.values());
  }

  /**
   * Looks up a model by ID or fuzzy matches.
   */
  public static getModel(id: string): ModelCapability | undefined {
    const clean = id.toLowerCase().replace(/^account:[^/]+\//, '').replace(/^[^/]+\//, '');
    return this.knowledgeCatalog.get(clean);
  }

  /**
   * Dynamically resolves the best matching model given a task's heat score and complexity tier.
   */
  public static resolveBestModel(tier: TaskTier, heatScore: number, preferredProvider?: ProviderType): ModelCapability {
    const candidates = Array.from(this.knowledgeCatalog.values()).filter(m => {
      if (preferredProvider && m.provider !== preferredProvider) return false;
      return m.tier === tier || (heatScore >= m.recommendedHeatMin && heatScore <= m.recommendedHeatMax);
    });

    if (candidates.length > 0) {
      // Sort candidate by proximity to heatScore and intelligence
      candidates.sort((a, b) => {
        const diffA = Math.abs((a.recommendedHeatMin + a.recommendedHeatMax) / 2 - heatScore);
        const diffB = Math.abs((b.recommendedHeatMin + b.recommendedHeatMax) / 2 - heatScore);
        return diffA - diffB;
      });
      return candidates[0];
    }

    // Default fallback
    return (
      this.getModel('gemini-2.5-pro') ||
      this.getModel('gemini-2.5-flash') ||
      Array.from(this.knowledgeCatalog.values())[0]
    );
  }

  /**
   * Dynamically detects running local model inference engines on the host:
   * 1. Ollama (default port 11434)
   * 2. LM Studio (default port 1234)
   * 3. vLLM / LocalAI (default port 8000)
   */
  public static async detectLocalServers(): Promise<LocalServerStatus[]> {
    const servers: Array<{ service: LocalServerStatus['service']; name: string; port: number; endpoint: string; path: string }> = [
      { service: 'ollama', name: 'Ollama Local Daemon', port: 11434, endpoint: 'http://127.0.0.1:11434', path: '/api/tags' },
      { service: 'lmstudio', name: 'LM Studio Server', port: 1234, endpoint: 'http://127.0.0.1:1234', path: '/v1/models' },
      { service: 'vllm', name: 'vLLM / LocalAI Server', port: 8000, endpoint: 'http://127.0.0.1:8000', path: '/v1/models' }
    ];

    const results: LocalServerStatus[] = [];

    for (const s of servers) {
      const check = await this.pingLocalEndpoint(s.port, s.path);
      if (check.online) {
        let models: string[] = [];
        try {
          const parsed = JSON.parse(check.data);
          if (Array.isArray(parsed.models)) {
            models = parsed.models.map((m: any) => m.name || m.id || String(m));
          } else if (Array.isArray(parsed.data)) {
            models = parsed.data.map((m: any) => m.id || m.name || String(m));
          }
        } catch (e) {
          models = ['local-model-default'];
        }

        // Register any discovered local models dynamically into knowledge catalog
        models.forEach(mName => {
          const mKey = mName.toLowerCase();
          if (!this.knowledgeCatalog.has(mKey)) {
            const isHeavy = mKey.includes('70b') || mKey.includes('32b') || mKey.includes('r1');
            this.register({
              id: mName,
              name: `${mName} (Discovered Local)`,
              provider: s.service === 'ollama' ? 'ollama' : 'local',
              tier: isHeavy ? TaskTier.TIER_3_STRATEGIC : TaskTier.TIER_2_TACTICAL,
              intelligenceLevel: isHeavy ? 5 : 3,
              recommendedHeatMin: isHeavy ? 65 : 20,
              recommendedHeatMax: isHeavy ? 100 : 75,
              contextWindow: 32000,
              costProfile: 'free_local',
              isLocal: true,
              bestFor: 'Local offline processing (Auto-Discovered from ' + s.name + ')',
              description: 'Dynamically discovered active local model running on host machine.'
            });
          }
        });

        results.push({
          service: s.service,
          name: s.name,
          endpoint: s.endpoint,
          isOnline: true,
          models,
          latencyMs: check.latencyMs
        });
      } else {
        results.push({
          service: s.service,
          name: s.name,
          endpoint: s.endpoint,
          isOnline: false,
          models: []
        });
      }
    }

    return results;
  }

  private static pingLocalEndpoint(port: number, reqPath: string): Promise<{ online: boolean; data: string; latencyMs: number }> {
    return new Promise(resolve => {
      const start = Date.now();
      const req = http.get(
        {
          host: '127.0.0.1',
          port,
          path: reqPath,
          timeout: 400
        },
        res => {
          let body = '';
          res.on('data', chunk => (body += chunk));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
              resolve({ online: true, data: body, latencyMs: Date.now() - start });
            } else {
              resolve({ online: false, data: '', latencyMs: 0 });
            }
          });
        }
      );

      req.on('error', () => resolve({ online: false, data: '', latencyMs: 0 }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ online: false, data: '', latencyMs: 0 });
      });
    });
  }

  /**
   * Dynamically queries upstream provider catalogs (Google Gemini, OpenAI, DeepSeek)
   * to discover newly announced models and register them into the knowledge registry.
   */
  public static async syncUpstreamModels(accounts: any[]): Promise<{ discoveredCount: number; newModels: string[] }> {
    const newModels: string[] = [];

    for (const acc of accounts) {
      if (!acc.enabled || !acc.apiKey || acc.apiKey === 'DEMO_KEY' || String(acc.apiKey).startsWith('LOCAL_')) {
        continue;
      }

      try {
        if (acc.provider === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${acc.apiKey}`;
          const data = await this.fetchJsonHttps(url);
          if (data && Array.isArray(data.models)) {
            for (const m of data.models) {
              const cleanId = (m.name || '').replace(/^models\//, '').trim();
              if (cleanId && !this.knowledgeCatalog.has(cleanId.toLowerCase())) {
                const isStrategic = cleanId.includes('pro') || cleanId.includes('thinking') || cleanId.includes('ultra');
                const isMicro = cleanId.includes('nano') || cleanId.includes('small') || cleanId.includes('1.5-flash-8b');
                const tier = isStrategic ? TaskTier.TIER_3_STRATEGIC : (isMicro ? TaskTier.TIER_1_MICRO : TaskTier.TIER_2_TACTICAL);
                const intelligence = isStrategic ? 5 : (isMicro ? 2 : 3);

                this.register({
                  id: cleanId,
                  name: m.displayName || cleanId,
                  provider: 'gemini',
                  tier,
                  intelligenceLevel: intelligence,
                  recommendedHeatMin: isStrategic ? 70 : (isMicro ? 0 : 30),
                  recommendedHeatMax: isStrategic ? 100 : (isMicro ? 30 : 75),
                  contextWindow: m.inputTokenLimit || 1000000,
                  costProfile: acc.tier?.startsWith('paid') ? 'paid_pro' : 'free_cloud',
                  isLocal: false,
                  bestFor: 'Auto-synced from Google Gemini API (' + (m.displayName || cleanId) + ')',
                  description: m.description || 'Dynamically discovered active model from Google Gemini API.'
                });
                newModels.push(cleanId);
              }
            }
          }
        } else if (acc.provider === 'openai') {
          const url = `https://api.openai.com/v1/models`;
          const data = await this.fetchJsonHttps(url, { 'Authorization': `Bearer ${acc.apiKey}` });
          if (data && Array.isArray(data.data)) {
            for (const m of data.data) {
              const cleanId = (m.id || '').trim();
              if (cleanId && (cleanId.startsWith('gpt-') || cleanId.startsWith('o1') || cleanId.startsWith('o3')) && !this.knowledgeCatalog.has(cleanId.toLowerCase())) {
                const isStrategic = cleanId.startsWith('o1') || cleanId.startsWith('o3') || cleanId.includes('4o');
                const tier = isStrategic ? TaskTier.TIER_3_STRATEGIC : TaskTier.TIER_2_TACTICAL;
                this.register({
                  id: cleanId,
                  name: cleanId,
                  provider: 'openai',
                  tier,
                  intelligenceLevel: isStrategic ? 5 : 3,
                  recommendedHeatMin: isStrategic ? 70 : 30,
                  recommendedHeatMax: isStrategic ? 100 : 75,
                  contextWindow: 128000,
                  costProfile: 'paid_pro',
                  isLocal: false,
                  bestFor: 'Auto-synced from OpenAI API (' + cleanId + ')',
                  description: 'Dynamically discovered active model from OpenAI API.'
                });
                newModels.push(cleanId);
              }
            }
          }
        }
      } catch (e) {
        // Soft fail per account
      }
    }

    return { discoveredCount: newModels.length, newModels };
  }

  private static fetchJsonHttps(urlStr: string, headers: Record<string, string> = {}): Promise<any> {
    return new Promise(resolve => {
      try {
        const u = new URL(urlStr);
        const req = https.get(
          {
            hostname: u.hostname,
            path: u.pathname + u.search,
            headers: {
              'User-Agent': 'AiMeshManager/2.2',
              ...headers
            },
            timeout: 4000
          },
          res => {
            let body = '';
            res.on('data', chunk => (body += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(body));
              } catch (e) {
                resolve(null);
              }
            });
          }
        );
        req.on('error', () => resolve(null));
        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }
}
