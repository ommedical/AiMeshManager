# Antigravity OmniGate ⚡

> **Next-Gen Intelligent AI Gateway, Dynamic Multi-Account Mesh & Token Optimizer for Google Antigravity 2.0, Antigravity IDE, Cursor, and Modern Development Environments.**

---

## 🌟 Key Innovations

1. **Intelligent Semantic Task Classifier (Zero-Touch Model Allocation):**
   * Inspects incoming prompts, context size, and tool schemas.
   * **Tier 1 (Micro/Syntax):** Tab autocomplete, docstrings, variable rename $\to$ Allocated to **Free Gemini Flash**.
   * **Tier 2 (Tactical Code):** Function generation, unit tests, bug fixes $\to$ Allocated to **Gemini Flash (Thinking) / Pro Free**.
   * **Tier 3 (Strategic Reasoning):** Architecture, multi-file agentic loops $\to$ Allocated to **Gemini Pro / Ultra on Paid Subscription**.

2. **Real-Time Token Compression & Context Pruner (RTK + AST Pruning):**
   * Automatically strips redundant whitespace, repetitive linebreaks, and comment bloat.
   * Real-time semantic prompt caching prevents billable token burn on repetitive IDE context turns (saving 15% to 50% in tokens).

3. **Multi-Account Quota Mesh & 50ms Transparent Failover:**
   * Pools multiple Free accounts (weekly reset window) and Paid accounts (rolling 5-hour window).
   * Catches HTTP 429 (`RESOURCE_EXHAUSTED` / `rateLimitExceeded`) and seamlessly reroutes to the backup account with zero dropped context.

4. **1-Click IDE Auto-Discovery & Zero-Config Injector:**
   * Automatically detects **Google Antigravity 2.0 / IDE**, **Cursor**, and **VS Code**.
   * Toggle connection on/off with a single switch in the Control Center UI—no manual JSON editing needed.

---

## 🚀 Quickstart Guide

### 1. Install & Run
```bash
# In the project directory:
npm install
npm run dev
```

The gateway starts at:
* **API Endpoint (OpenAI / Gemini compatible):** `http://localhost:20128/v1`
* **Interactive Control Center Dashboard:** `http://localhost:20128`

---

## 🔌 Connecting to Your Tools

### Google Antigravity 2.0 & Antigravity IDE
Open the dashboard at `http://localhost:20128` and toggle the **Google Antigravity** switch to **ON**, or run the sidecar registration in `~/.gemini/config/sidecars/omniroute/sidecar.json`.

### Cursor Editor
1. Open Cursor Settings $\to$ **Models**.
2. Set **OpenAI API Base URL** to: `http://localhost:20128/v1`
3. Enter any string as the API Key (e.g. `omnigate-local`).

### VS Code (Continue / Cline / Roo Code)
In your `settings.json`:
```json
{
  "continue.apiBase": "http://localhost:20128/v1"
}
```

---

## 📊 Complete Event, Logic & Failover Matrix

| Event / Condition | Detection Mechanism | Gateway Action | State Preservation |
| :--- | :--- | :--- | :--- |
| **Micro Syntax Task** | Prompt size < 1.2kb + syntax keywords | Routes to Free Gemini Flash | Instant sub-second response |
| **Strategic Reasoning Task** | Multi-file context > 15kb or complex planning | Routes to Paid Gemini Pro | Maximum context window allocated |
| **Free Tier 429 Rate Limit** | HTTP 429 with `retry-after` header | Immediate switch to Account 2 | In-flight payload buffered and replayed |
| **5-Hour Paid Window Full** | Rolling usage reaches 100% | Downgrades to Flash tier until reset | Full transcript preserved on disk |
| **Repeated Prompt Turns** | SHA256 context signature hit | Returns from Semantic Cache | 0 billable tokens consumed |

---

## 🛠️ Repository Structure

```
antigravity_multi_auth/
├── src/
│   ├── accounts/
│   │   └── manager.ts       # Multi-account pool & quota manager
│   ├── router/
│   │   └── classifier.ts    # Semantic task classifier & model allocator
│   ├── optimizer/
│   │   └── compressor.ts    # Real-time token compressor & prompt cache
│   ├── integrations/
│   │   └── ide-detector.ts  # 1-Click IDE auto-discovery & config injector
│   └── server.ts            # High-performance local proxy server
├── public/
│   └── index.html           # Modern glassmorphic Control Center UI
├── package.json
└── tsconfig.json
```

---

## 📄 License
MIT © 2026 Antigravity Engineering
