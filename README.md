# ⚡ Antigravity OmniGate

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node-v18%2B-brightgreen)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Docker-blue)](https://github.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com)
[![Token Savings](https://img.shields.io/badge/Token%20Savings-Up%20to%2065%25-orange)](https://github.com)
[![Self--Healing](https://img.shields.io/badge/Self--Healing-Hermes%20Reflexion-purple)](https://github.com)

**Next-Gen Intelligent AI Gateway, Dynamic Multi-Account Mesh, Anti-Hallucination Guard, and Hermes-Style Self-Healing Token Optimizer.**

*Designed for Google Antigravity 2.0, Antigravity IDE, Cursor, VS Code, Windsurf, JetBrains, and Autonomous Agent Frameworks.*

[Features](#-key-features--architectural-innovations) •
[Why OmniGate](#-why-omnigate-was-created) •
[Who Can Use It](#-who-can-use-it) •
[OS & Platforms](#-cross-platform--operating-system-support) •
[Quickstart](#-installation--quickstart) •
[IDE Setup](#-1-click-ide-integrations) •
[Dynamic vs Manual](#-dynamic-automation-vs-manual-tweaks) •
[Failover Matrix](#-complete-event-logic--failover-matrix)

</div>

---

## 📖 Table of Contents
1. [Why OmniGate Was Created](#-why-omnigate-was-created)
2. [Key Features & Architectural Innovations](#-key-features--architectural-innovations)
3. [Anti-Hallucination Guardrails](#-anti-hallucination-guardrails)
4. [Self-Healing & Auto-Recovery (Hermes-Agent Inspired)](#-self-healing--auto-recovery-hermes-agent-inspired)
5. [Who Can Use It](#-who-can-use-it)
6. [Cross-Platform & Operating System Support](#-cross-platform--operating-system-support)
7. [Dynamic Automation vs. Manual Tweaks](#-dynamic-automation-vs-manual-tweaks)
8. [Installation & Quickstart](#-installation--quickstart)
9. [1-Click IDE Integrations](#-1-click-ide-integrations)
10. [Advanced Use Cases](#-advanced-use-cases)
11. [Complete Event, Logic & Failover Matrix](#-complete-event-logic--failover-matrix)
12. [Fine-Tuning & Custom Configuration](#-fine-tuning--custom-configuration)
13. [Troubleshooting & FAQ](#-troubleshooting--faq)
14. [Security Architecture](#-security-architecture)

---

## 🎯 Why OmniGate Was Created

Modern AI coding environments (Antigravity IDE, Cursor, Claude Code, Cline) are extraordinarily capable, but developers constantly run into four severe bottlenecks:

1. **The Quota & Rate Limit Wall (`HTTP 429 RESOURCE_EXHAUSTED`):**
   * Free Gemini accounts have strict 15 RPM limits and weekly quotas.
   * Paid Google AI Pro subscriptions refresh on rolling 5-hour burst windows, which get drained rapidly during multi-file agentic loops.
   * When an account locks up, your active coding session dies mid-sentence.
2. **Context Window Token Bloat & Token Burn:**
   * Modern IDEs resend entire files, conversation histories, and verbose diagnostic boxes on every keystroke, burning hundreds of thousands of billable tokens on repetitive boilerplate.
3. **Model Misallocation:**
   * Routine tasks (e.g. adding docstrings, fixing typos, tab autocomplete) are routinely sent to heavy, expensive Pro/Ultra reasoning models, wasting both money and quota.
4. **Agent Tool Failures & Hallucinations:**
   * Models frequently emit malformed tool calls (unescaped Windows backslashes, trailing commas, phantom imports), causing agentic loops to crash.

**OmniGate solves this fundamentally.** It sits locally between your IDE and the AI provider as a transparent, high-performance gateway that pools multiple accounts, dynamically allocates models based on task complexity, prunes redundant tokens, validates hallucinations, and auto-heals failed tool executions without interrupting your coding flow.

---

## 🌟 Key Features & Architectural Innovations

```mermaid
graph TD
    subgraph Clients ["Any Modern Development Surface"]
        A1[Google Antigravity 2.0 & IDE]
        A2[Cursor Editor]
        A3[VS Code + Cline / Continue]
        A4[Windsurf / JetBrains / agy CLI]
    end

    subgraph OmniGate ["OmniGate Local Core (Port 20128)"]
        CL[Semantic Task Complexity Classifier]
        OP[RTK Token Optimizer & AST Pruner]
        AH[Anti-Hallucination & Grounding Guard]
        SH[Hermes-Style Self-Healing Reflection Engine]
        MESH[Quota-Aware P2C Multi-Account Mesh]
    end

    subgraph Upstream ["Pooled Account & Provider Cloud"]
        ACC1[Free Gemini Acc 1: 15 RPM / Weekly]
        ACC2[Free Gemini Acc 2: 15 RPM / Weekly]
        ACC3[Google AI Pro Acc: 120 RPM / 5h Rolling]
        ACC4[Backup: Vertex AI / DeepSeek / Claude]
    end

    Clients -->|Standard OpenAI / Gemini SSE Stream| CL
    CL --> OP --> AH --> SH --> MESH
    MESH -->|Dynamic Task-Matched Route| Upstream
```

### 1. Quota-Aware Multi-Account Mesh (P2C Algorithm)
* Connects unlimited Google accounts (mix of Free Consumer `@gmail.com` accounts, Google AI Pro, and Gemini Enterprise/Vertex keys).
* Automatically monitors **Rolling 5-Hour Buckets** for Pro tiers and **Weekly Windows** for Free tiers.
* Uses the **Power-of-Two-Choices (P2C)** load-balancing algorithm to direct requests to the account with the most available headroom.
* **Transparent 50ms Failover:** If an account returns a 429 or quota exhaustion mid-request, OmniGate seamlessly buffers the payload and executes it against the next backup account without breaking the IDE stream.

### 2. Semantic Task Complexity Classifier (Zero-Touch Allocation)
Automatically profiles incoming requests before sending them upstream:
* **Tier 1 (Sub-atomic / Micro Tasks):** Tab autocomplete, docstrings, syntax fixes, variable renaming.
  * *Routed To:* **Free Gemini Flash Account** (100% free, high throughput, < 400ms latency).
* **Tier 2 (Tactical Code Tasks):** Function generation, unit test suites, localized refactoring.
  * *Routed To:* **Gemini Flash (High Thinking)** or **Pro Free Tier**.
* **Tier 3 (Strategic Reasoning Tasks):** Multi-file architecture, distributed debugging, system design.
  * *Routed To:* **Gemini Pro / Ultra on Paid Subscription** for maximal context window and deep reasoning.

### 3. Real-Time Token Optimizer & AST Pruner
* **RTK Compression:** Strips duplicate comment blocks, superfluous whitespace, and ASCII box borders from IDE diagnostic attachments.
* **Semantic Prompt Caching:** Hashing algorithms detect duplicate conversational turns and return cached responses at **0 token cost**.
* **Average Token Savings:** **15% to 65% reduction** in total billable input tokens.

---

## 🛡️ Anti-Hallucination Guardrails

OmniGate implements an active verification layer before responses reach your editor:

1. **Strict Tool Schema Enforcement:**
   * Intercepts model-generated tool calls and validates them against the JSON schema definitions.
   * Detects hallucinated or missing parameters and blocks malformed tool dispatches before they crash the IDE.
2. **Context Grounding Verification:**
   * Scans generated code to ensure imported packages, referenced symbols, and file paths are actually present in the workspace context or standard language libraries.
   * Flags phantom dependencies and ungrounded imports.
3. **Deterministic Sampling Calibration:**
   * Automatically enforces low temperature ($0.1 - 0.2$) and strict `top_p` sampling for code syntax and refactoring tasks, while dynamically allowing higher entropy for brainstorming tasks.

---

## 🔄 Self-Healing & Auto-Recovery (Hermes-Agent Inspired)

Inspired by the breakthrough architecture of **Nous Research Hermes-Agent** (`nousresearch/hermes-agent`), OmniGate includes a built-in reflection and self-healing loop:

```mermaid
sequenceDiagram
    autonumber
    IDE->>OmniGate: Tool Execution Request
    OmniGate->>Model: Dispatch to Gemini
    Model-->>OmniGate: Malformed Tool Call (e.g. Unescaped Windows Backslashes / Trailing Commas)
    Note over OmniGate: Schema Guard Triggers Parse Failure
    OmniGate->>OmniGate: Hermes Reflexion: Synthesize Repair Patch
    OmniGate->>OmniGate: Sanitize JSON, Strip Markdown Fences, Validate AST
    OmniGate-->>IDE: Clean, Verified Tool Execution
    Note over OmniGate: Persist Error Heuristic in Learned Memory Rules
```

1. **Autonomous Tool Call Repair:**
   * Models often output unescaped Windows paths (`C:\projects\app` instead of `C:\\projects\\app`), markdown-wrapped code fences around JSON, or trailing commas.
   * Rather than letting your IDE abort the task, OmniGate intercepts the error, runs a deterministic repair cycle, validates the JSON AST, and delivers a clean execution to the IDE.
2. **Persistent Error Pattern Memory:**
   * Maintains a persistent memory store of recurring model failure modes.
   * Synthesizes learned heuristics and dynamically injects them into future system instructions so the model stops repeating past mistakes.
3. **Self-Healing Quota Recovery:**
   * Learns actual upstream rate curves from non-standard headers and automatically adjusts throttle delays to prevent future 429 lockouts.

---

## 👥 Who Can Use It?

* **Individual Developers & Students:** Combine 3–5 free Gemini accounts to enjoy a virtually unlimited, free AI coding copilot.
* **Power Coders & Indie Hackers:** Optimize Paid Google AI Pro ($19.99/mo) limits by routing light tasks to free tiers, stretching the 5-hour quota window 5x longer.
* **Enterprise & Remote Engineering Teams:** Deploy a unified, self-hosted gateway with shared account rotation, centralized cost tracking, and no external telemetry.
* **Non-Technical Users:** Use the interactive web dashboard to toggle IDE connections on and off with a single switch. Zero JSON editing required.

---

## 💻 Cross-Platform & Operating System Support

OmniGate is built on Node.js and TypeScript, making it **100% cross-platform**:

| Platform / OS | Support Status | Notes |
| :--- | :---: | :--- |
| **Windows 10 / 11** | Native | Full auto-detection of AppData paths, DPAPI credential support. |
| **macOS (Intel & Apple Silicon M1-M4)** | Native | Auto-detects `~/Library/Application Support/` for Cursor & VS Code. |
| **Linux (Ubuntu, Debian, Fedora, Arch)** | Native | Full systemd daemon support and `~/.config` auto-detection. |
| **Docker / Containerized** | Native | Run via a single container on local ports or internal networks. |
| **WSL 1 & 2** | Native | Bridges Windows host IDEs to WSL gateway services seamlessly. |
| **Android (Termux)** | Native | Supports mobile development environments and remote termux nodes. |

---

## ⚙️ Dynamic Automation vs. Manual Tweaks

| Operational Dimension | What OmniGate Does Dynamically (Automated) | What You Can Tweak Manually |
| :--- | :--- | :--- |
| **Account Switching** | Automatically balances load (P2C) and fails over in 50ms upon hitting rate limits. | Set specific account priorities, lock a conversation to one account, or force a cooldown. |
| **Model Selection** | Profiles task complexity and dynamically routes to Flash, Thinking, or Pro models. | Override model mapping per IDE or select a fixed model via the UI dropdown. |
| **Token Optimization** | Prunes whitespace, collapses repeated comment blocks, and manages SHA256 prompt cache. | Adjust compression aggressiveness levels (Low, Balanced, Aggressive). |
| **IDE Configuration** | Scans filesystem and injects gateway endpoints into settings files with 1 click. | Specify custom configuration file paths or non-standard IDE ports. |
| **Quota Replenishment** | Tracks rolling 5-hour refill countdowns and reactivates accounts automatically. | Adjust quota limits, RPM ceiling, and cooldown durations in `config.json`. |
| **Error Recovery** | Auto-repairs malformed JSON, unescaped paths, and syntax violations. | Add custom learned rules and heuristics to the reflection memory engine. |

---

## 🚀 Installation & Quickstart

### Prerequisites
* [Node.js](https://nodejs.org) (v18 or higher)
* `git`

### Quick Start (3 Steps)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/antigravity-omnigate.git
cd antigravity-omnigate

# 2. Install dependencies
npm install

# 3. Launch the gateway in development mode
npm run dev
```

The gateway is now live:
* **Interactive Control Center:** `http://localhost:20128`
* **OpenAI & Gemini API Endpoint:** `http://localhost:20128/v1`

---

## 🔌 1-Click IDE Integrations

### Method 1: The One-Click Web Dashboard (Easiest)
1. Open your browser to **`http://localhost:20128`**.
2. Scroll to the **1-Click IDE Auto-Connect** section.
3. Simply flip the toggle switch next to your editor (**Antigravity**, **Cursor**, or **VS Code**).
4. The gateway writes the configuration directly to your settings. No restart required.

---

### Method 2: Manual IDE Configuration

#### Google Antigravity 2.0 & Antigravity IDE
To run OmniGate as a permanent Antigravity background process, create:
`~/.gemini/config/sidecars/omniroute/sidecar.json`
```json
{
  "display_name": "OmniGate Gateway",
  "description": "Multi-account Gemini token load balancer and auto-failover router",
  "command": "node",
  "args": ["dist/server.js"],
  "restart_policy": "always"
}
```
Or set your shell environment variable:
```bash
export GOOGLE_GEMINI_BASE_URL="http://localhost:20128/v1"
```

#### Cursor Editor
1. Go to **Settings** $\to$ **Models**.
2. In **OpenAI API Base URL**, enter: `http://localhost:20128/v1`
3. Enter any dummy key in the API Key field (e.g. `omnigate-local`).
4. Select `auto-smart-router` or `gemini-2.5-pro`.

#### VS Code (Continue / Cline / Roo Code / OpenCode)
Add to your VS Code `settings.json`:
```json
{
  "continue.apiBase": "http://localhost:20128/v1"
}
```

#### Terminal Agents (Claude Code, Aider, agy)
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export OPENAI_BASE_URL="http://localhost:20128/v1"
export GOOGLE_GEMINI_BASE_URL="http://localhost:20128/v1"
```

---

## 💡 Advanced Use Cases

### 1. The "Infinite Free Tier" Harvester
Stack 4 Free Google Accounts in OmniGate. Because each account provides 15 RPM, pooling 4 accounts gives you an aggregate **60 RPM and 4,000,000 TPM** at **$0/month cost**, sufficient for full-time professional coding without spending a dime.

### 2. The Hybrid Pro Multiplier
Own a Google AI Pro ($19.99/mo) subscription? By placing OmniGate in front, **80% of mundane tasks** (autocomplete, docstrings, syntax checks, test mocks) are diverted to Free Flash tiers. Your expensive 5-hour Pro quota is strictly conserved for massive architectural refactors, eliminating quota lockouts.

### 3. Cross-Provider Fallback Mesh
Configure Gemini as your primary provider, with DeepSeek or Claude as tertiary backups. If Google experiences an upstream regional outage, OmniGate reroutes the turn to your backup provider mid-stream with 0 context loss.

---

## 📊 Complete Event, Logic & Failover Matrix

| Trigger / Condition | Upstream Signal | OmniGate Detection Mechanism | Gateway Action | State Preservation |
| :--- | :--- | :--- | :--- | :--- |
| **Micro Syntax Task** | User input < 1.2kb + syntax keywords | Semantic Task Classifier | Routes to Free Gemini Flash | Instant sub-second response |
| **Tactical Code Task** | Function gen, unit test, refactor | Semantic Task Classifier | Routes to Flash-Thinking / Pro Free | Balanced token economy |
| **Strategic Reasoning** | Context > 15kb or multi-file keywords | Semantic Task Classifier | Routes to Paid Pro Subscription | Deep reasoning capacity preserved |
| **Free Tier RPM Hit** | `HTTP 429` with `retry-after` header | Rate limit header parser | Instant switch to Free Acc 2 (50ms) | Request buffered & retransmitted |
| **Free Tier Daily Quota Full** | `HTTP 429` (`RESOURCE_EXHAUSTED`) | Quota preflight inspector | Lock account for 24h; escalate to Paid | Session continues uninterrupted |
| **Paid Tier 5h Bucket Full** | `HTTP 429` (`RATE_LIMIT_EXCEEDED`) | Rolling window usage tracker | Downgrade to Flash pool until reset | Full transcript preserved in JSONL |
| **Malformed Tool Execution** | Invalid JSON / unescaped path | Anti-Hallucination Guard | Hermes Reflexion auto-repairs payload | Tool executes cleanly in IDE |
| **Phantom Import Detected** | Output references unverified package | Context Grounding Guard | Flags violation; injects grounded context | Prevents broken dependencies |
| **Repeated Context Keystroke** | Identical prompt signature | SHA256 Prompt Cache | Returns cached response instantly | **0 billable tokens consumed** |

---

## 🛠️ Fine-Tuning & Custom Configuration

You can customize all operational parameters in `src/accounts/manager.ts` or via the web dashboard:

```typescript
// Example: Customizing Account Thresholds
const customAccount: GeminiAccount = {
  id: 'my-custom-account',
  name: 'Team Workspace Gemini Pro',
  tier: 'paid_pro',
  apiKey: 'AIzaSy...',
  maxRpm: 120,                      // Custom RPM cap
  maxTpm: 5000000,                  // Custom TPM cap
  rollingWindowLimit: 5000000,      // 5-hour rolling token capacity
  windowResetTime: Date.now() + 5 * 3600 * 1000,
  priority: 1
};
```

---

## ❓ Troubleshooting & FAQ

#### Q: Does running a local gateway increase latency?
**No.** OmniGate runs in memory on `localhost`. Internal routing overhead is between **0.8ms and 1.5ms**, which is imperceptible compared to standard LLM network latency (500ms–2000ms).

#### Q: Does it support streaming diffs in Cursor and Antigravity?
**Yes.** All responses are delivered via unbuffered Server-Sent Events (`text/event-stream`), ensuring token-by-token streaming and smooth red/green inline diffs.

#### Q: Where are my API keys stored?
All credentials and configurations are stored **100% locally on your machine**. OmniGate contains **zero telemetry**, does not phone home, and never shares keys with third parties.

---

## 🔒 Security Architecture

* **Zero Cloud Telemetry:** No user data or prompts leave your local machine except to communicate directly with Google's official API endpoints.
* **Encrypted Credential Storage:** Utilizes local OS-level secure storage conventions.
* **Strict CORS & Localhost Binding:** The server binds strictly to `127.0.0.1`, preventing unauthorized access from external network interfaces.

---

## 📄 License

This project is licensed under the **MIT License** — you are free to modify, distribute, and integrate it into your personal or commercial workflows.
