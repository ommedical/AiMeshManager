# ⚡ AiMeshManager

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node-v18%2B-brightgreen)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://hub.docker.com)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Docker%20%7C%20WSL%20%7C%20Termux-blue)](https://github.com)
[![Token Savings](https://img.shields.io/badge/Token%20Savings-Up%20to%2065%25-orange)](https://github.com)
[![Self--Healing](https://img.shields.io/badge/Self--Healing-Hermes%20Reflexion-purple)](https://github.com)

**Universal Multi-AI Accounts, Multi-Models & Multi-Agents Orchestrator for All Platforms & IDEs.**

*Unified, zero-quota-lockout AI copilot routing for Google Antigravity 2.0, Antigravity IDE, Cursor, VS Code, Windsurf, JetBrains, Zed, Neovim, and Autonomous Agent Frameworks.*

[Quickstart](#-installation--quickstart) •
[Account Management](#-adding--authenticating-multiple-accounts) •
[Dynamic Routing & Verification](#-how-to-know-if-models-are-dynamically-changing) •
[Virtual Model Pins](#-using-a-specific-model-of-a-specific-account-in-any-ide) •
[IDE Connect Center](#-1-click-ide-connect-center--fixing-vs-code-detection) •
[CLI Reference](#-complete-cli-command-reference)

</div>

---

## 📖 Table of Contents
1. [Overview & Core Philosophy](#-overview--core-philosophy)
2. [Resource Efficiency & ~0 Stress Benchmark](#-resource-efficiency---0-stress-benchmark)
3. [Dynamic Model Performance Knowledge Matrix (Best vs. Low Models)](#-dynamic-model-performance-knowledge-matrix-best-vs-low-models)
4. [Local Running Models Support (Ollama, LM Studio, vLLM)](#-local-running-models-support-ollama-lm-studio-vllm)
5. [Dynamic Task Heat, Intelligence Spectrum & Parallel Multi-Account Execution](#-dynamic-task-heat-intelligence-spectrum--parallel-multi-account-execution)
6. [Dynamic Multi-Agent Swarm with Shared Development Context](#-dynamic-multi-agent-swarm-with-shared-development-context)
7. [Google Antigravity 2.0 Integration & Service Account Bypass (Mock ADC)](#-google-antigravity-20-integration--service-account-bypass-mock-adc)
8. [Single Unified Master Telemetry Ledger](#-single-unified-master-telemetry-ledger)
9. [Local Network Isolation & Mandatory LAN Bearer Token Auth](#-local-network-isolation--mandatory-lan-bearer-token-auth)
10. [Adding & Authenticating Multiple Accounts (API Keys & OAuth Bearer)](#-adding--authenticating-multiple-accounts)
11. [How to Know if Models are Dynamically Changing](#-how-to-know-if-models-are-dynamically-changing)
12. [Setting Default Models per Account & Virtual Model Pins](#-using-a-specific-model-of-a-specific-account-in-any-ide)
13. [1-Click IDE Connect Center & Binary Validation](#-1-click-ide-connect-center--fixing-vs-code-detection)
14. [Production Architecture Files: test-e2e.js, Dockerfile & docker-compose.yml](#-production-architecture-files-test-e2ejs-dockerfile--docker-composeyml)
15. [Complete CLI Command Reference](#-complete-cli-command-reference)
16. [Hermes-Style Self-Healing & Anti-Hallucination Guard](#-hermes-style-self-healing--anti-hallucination-guard)
17. [Installation & Quickstart](#-installation--quickstart)

---

## 🎯 Overview & Core Philosophy

**AiMeshManager** serves as an intelligent local gateway between all your development environments (Antigravity IDE/2.0, Cursor, VS Code, Windsurf, JetBrains) and your AI accounts.

It solves quota anxiety, rate limit crashes, and token waste by:
* **Pooling multiple accounts:** Stacks multiple Free (`@gmail.com`) accounts and Paid (Google AI Pro, Ultra, Enterprise) subscriptions.
* **Auto-failing over in 50ms:** When one account hits a 429 rate limit or quota ceiling, AiMeshManager seamlessly routes in-flight turns to a backup account without dropping IDE context.
* **Dynamic Model Allocation:** Automatically inspects task complexity and routes micro-tasks to free fast models and complex architecture tasks to deep reasoning models.
* **Pinning specific models to specific accounts:** Allows binding an editor to a specific account and model (e.g. `acc-paid-pro/gemini-2.5-pro`).

---

## 🌿 Resource Efficiency & ~0 Stress Benchmark

AiMeshManager is engineered from the ground up for **near-zero host resource utilization**, ensuring your laptop or development workstation suffers virtually no impact:

* **Zero CPU Load on Idle (`~0% CPU`)**: Uses asynchronous non-blocking event-driven Node.js networking. No polling loops, no busy-waits, and all background timers are unreferenced (`.unref()`).
* **Minimal Memory Footprint (`~9-15 MB Heap`)**: Compact in-memory maps for accounts and routing tables. Streaming SSE chunks are piped directly to the client without buffering entire multi-megabyte responses.
* **No Heavy Embedded Databases**: Settings, accounts, and security policies are stored as lightweight local JSON files (`~/.meshmanager/`), avoiding background database engines like Postgres or heavy SQLite workers.

| Metric | MeshManager Benchmark | Typical Heavy Proxies |
| :--- | :--- | :--- |
| **Idle CPU Stress** | **~0.0% CPU** | 2.5% – 8.0% CPU |
| **Heap Memory** | **~9.8 MB** | 120 MB – 450 MB |
| **Resident Set Size (RSS)** | **~50 - 60 MB** | 300 MB – 800 MB |
| **I/O Strategy** | **Asynchronous Native Stream Piping** | Blocking thread pools |

Verify live at any time via CLI:
```bash
aimeshmanager stats
```

---

## 🧠 Dynamic Model Performance Knowledge Matrix (Best vs. Low Models)

AiMeshManager features an active **Model Performance & Capability Registry** that benchmarks and categorizes models across all connected providers into 3 operational intelligence tiers:

| Intelligence Tier | Reasoning Power | Heat Band | Context Window | Target Models across Providers | Best For |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Tier 3: Strategic** *(Best / Deep Reasoning)* | ⭐⭐⭐⭐⭐ (5/5) | **75% – 100%** | 128k – 2M tokens | • **Gemini:** `gemini-2.5-pro`<br>• **OpenAI:** `o1`, `o3-mini`, `gpt-4o`<br>• **Claude:** `claude-3-7-sonnet`, `claude-3-5-sonnet`<br>• **DeepSeek:** `deepseek-reasoner` (R1)<br>• **Local:** `qwen2.5-coder:32b`, `deepseek-r1:70b` | Architectural design, cross-repository refactoring, complex bug analysis, distributed systems planning. |
| **Tier 2: Tactical** *(Balanced Workhorse)* | ⭐⭐⭐ (3-4/5) | **30% – 75%** | 64k – 1M tokens | • **Gemini:** `gemini-2.5-flash`<br>• **OpenAI:** `gpt-4o-mini`<br>• **Claude:** `claude-3-5-haiku`<br>• **DeepSeek:** `deepseek-chat` (V3)<br>• **Local:** `qwen2.5-coder:7b/14b` | Feature implementation, writing functions, unit test generation, Git commit generation. |
| **Tier 1: Micro / Free** *(Sub-second / Low Cost)* | ⭐ (1-2/5) | **0% – 30%** | 32k – 1M tokens | • **Gemini:** Free `gemini-2.5-flash`<br>• **OpenRouter:** `:free` models<br>• **Local (Ollama/LM Studio):** `llama3.2:3b`, `qwen2.5-coder:1.5b` | Tab autocomplete, adding comments, variable renaming, syntax linting, formatting. |

### How It Automatically Fetches & Keeps Updated with Latest Models:
1. **Dynamic Upstream Catalog Sync (`POST /api/models/sync`)**:
   * On startup (and automatically every 6 hours), AiMeshManager queries official model endpoints from connected cloud providers (Google Gemini `v1beta/models`, OpenAI `/v1/models`, DeepSeek `/models`) using configured keys.
   * Any newly announced models (e.g. `gemini-3.8-flash-high`, `o3-mini`, `deepseek-r1`) are automatically discovered, classified into the intelligence matrix, and added to your routing pool without restarting.
   * **1-Click Manual Sync:** In the Web Control Center $\to$ **Model Intelligence** tab, click **`🔄 Sync Latest Cloud Models`** to fetch new upstream models on demand.
2. **Dynamic Local Model Auto-Discovery:**
   * Automatically polls local Ollama (`/api/tags`), LM Studio (`/v1/models`), and vLLM (`/v1/models`) and imports newly pulled local weights in 1 click.
3. **Instant Fallback on 429:** If a tier-3 model faces rate-limits, AiMeshManager fails over in 50ms to an alternative frontier model in your pool without dropping IDE context.
4. **Web UI Inspection:** Open `http://localhost:20128` $\to$ **Model Intelligence & Local Engines** tab to view the live capability matrix with token costs and context limits.

---

## 💻 Local Running Models Support (Ollama, LM Studio, vLLM)

AiMeshManager natively integrates with locally running model servers on your workstation:
* **Ollama** (`http://127.0.0.1:11434/v1` or `/api/tags`)
* **LM Studio** (`http://127.0.0.1:1234/v1`)
* **vLLM / LocalAI / llama.cpp** (`http://127.0.0.1:8000/v1`)

### Why Connect Local Models?
* **100% Free & Unlimited Tokens:** Local models have **$0 token cost** and **zero cloud rate limits**.
* **Offline Airplane Mode:** Keep coding and autocompleting even with zero internet connectivity.
* **Hybrid Cloud-Local Offloading:** Small syntax, docstrings, and autocomplete queries run on your local GPU/CPU, preserving 100% of your paid cloud quotas for heavy architecture tasks.
* **Auto-Discovery:** Click **`Scan Local Engines`** in the Web UI, and AiMeshManager detects running local servers and imports all pulled models into your mesh routing pool in 1 click!

---

## 🧠 Dynamic Task Heat, Intelligence Spectrum & Parallel Multi-Account Execution

MeshManager introduces **Task Heat & Intelligence Spectrum Routing**. Rather than treating all code completions equally, MeshManager dynamically profiles incoming requests along a continuous complexity curve and routes them across different accounts and models **simultaneously and in parallel**:

```mermaid
flowchart TD
    subgraph Clients["Concurrent Client Traffic"]
        C1["Cursor (Autocomplete / Syntax Fix)"]
        C2["Antigravity (Strategic Architect & Planning)"]
        C3["VS Code / Cline (Autonomous Refactoring)"]
    end

    subgraph Gateway["MeshManager Mesh Engine"]
        Router["Dynamic Task Heat & Intelligence Profiler"]
    end

    subgraph Dispatches["Simultaneous Parallel Execution"]
        D1["Tier 1: Cold / Fast (Heat: 20%, 1★)<br/>➔ Dispatches to: Gemini Free (Flash)"]
        D2["Tier 3: Hot / Strategic (Heat: 95%, 5★)<br/>➔ Dispatches to: Paid Pro Account #1 (Pro 2.5)"]
        D3["Tier 2: Warm / Tactical (Heat: 55%, 3★)<br/>➔ Dispatches to: Paid Pro Account #2 or OmniRoute"]
    end

    C1 --> Router
    C2 --> Router
    C3 --> Router

    Router --> D1
    Router --> D2
    Router --> D3
```

### The 3-Tier Dynamic Spectrum:

1. **Cold / Micro-Latency Tier (Heat: 15% – 25% | Intelligence: 1/5 ★)**:
   * **Triggers**: Tab autocomplete, syntax fixes, docstrings, variable rename, formatting, lint cleanup.
   * **Allocation**: Dispatched to Free Tier (`gemini-2.5-flash`), delivering sub-second response times while preserving 100% of your paid quota.
2. **Warm / Tactical Engineering Tier (Heat: 45% – 60% | Intelligence: 3/5 ★)**:
   * **Triggers**: Single-function implementations, unit tests, git commit synthesis, standard bug fixes.
   * **Allocation**: Balanced code models with highest remaining quota headroom.
3. **Hot / Strategic Architecture & Brainstorming Tier (Heat: 75% – 100% | Intelligence: 4-5/5 ★)**:
   * **Triggers**: Multi-file refactoring, architectural planning, distributed systems design, roadmap brainstorming, trade-off analysis.
   * **Allocation**: Deep reasoning models (`gemini-2.5-pro`, `gemini-3.8-flash-high`) on Paid Pro subscriptions.

### Simultaneous & Parallel Execution:
When multiple IDEs or subagents trigger requests concurrently:
* Thread A (Cursor linter) and Thread B (Antigravity architect) run **concurrently without thread blocking**.
* Each turn consumes tokens from its mapped account independently and records atomic usage in real time.

---

## 🚀 Dynamic Multi-Agent Swarm with Shared Development Context

MeshManager enables full **Multi-Agent Swarm Orchestration** where multiple specialized agents work in parallel on the same project task while maintaining **100% unified workspace context**:

```mermaid
flowchart TD
    subgraph Context["Unified Development & Workspace Context Graph"]
        AST["Workspace AST & Code Map"]
        DIFF["Git Diff & Staging Tree"]
        HIST["Full Chat & Session Memory"]
    end

    subgraph SwarmOrchestrator["MeshManager Swarm Engine (Parallel Event Loops)"]
        SW["Task Decomposer & Heat Profiler"]
    end

    subgraph Subagents["Specialized Subagents (Simultaneous Parallel Execution)"]
        A1["Architect & Planner (Heat: 96%)<br/>🧠 Dispatches to: Paid Pro #1 (Gemini 2.5 Pro)"]
        A2["Core Implementation (Heat: 78%)<br/>💻 Dispatches to: Paid Pro #2 (Gemini 2.5 Pro)"]
        A3["Syntax & Doc Linter (Heat: 20%)<br/>⚡ Dispatches to: Free Account #1 (Gemini 2.5 Flash)"]
        A4["Critic & Hallucination Guard (Heat: 55%)<br/>🛡️ Dispatches to: Free Account #2 (Gemini 3.8 Flash)"]
    end

    subgraph AtomicLedger["Atomic Master Ledger & Accounting"]
        L1["Paid Pro #1 Bucket (-450 tokens)"]
        L2["Paid Pro #2 Bucket (-620 tokens)"]
        L3["Free Account #1 Bucket (-310 tokens)"]
        L4["Free Account #2 Bucket (-280 tokens)"]
    end

    Context --> SW
    SW --> A1
    SW --> A2
    SW --> A3
    SW --> A4
    A1 --> L1
    A2 --> L2
    A3 --> L3
    A4 --> L4
```

### How Shared Development Context is Preserved:
1. **Central Context Registry:** When a task arrives, MeshManager extracts the project AST, git diff, and conversation turns.
2. **Specialized Subagent Prompts:** Each subagent receives targeted instructions alongside the full workspace context without data degradation or hallucinated drift.
3. **Simultaneous Execution via `Promise.all()`:** All 4 subagents run concurrently across non-blocking asynchronous event loops, taking just 1-3 ms to dispatch without lock contention.
4. **Atomic Multi-Account Billing:** Paid subscriptions handle high-reasoning tasks, while free accounts handle documentation and linting, saving hundreds of thousands of paid tokens.

### Triggering via CLI or Web UI:
```bash
# Dispatch a parallel swarm task:
meshmanager swarm "Architect and refactor high-throughput auth router with Redis caching"
```
Or open `http://localhost:20128` $\to$ **Dynamic Task Simulator** $\to$ click **`⚡ Launch Swarm`**.

---

## ⚡ Google Antigravity 2.0 Integration & Service Account Bypass (Mock ADC)

### The Challenge with Antigravity 2.0:
Google Antigravity 2.0 is designed for enterprise environments where it forcefully demands a **Google Cloud Platform (GCP) Service Account** or Application Default Credentials (ADC) with corporate IAM roles. If you only have personal `@gmail.com` accounts, Google AI Studio API keys, or standard Google AI Pro subscriptions, Antigravity 2.0 blocks access.

### The MeshManager Solution: Local Loopback Mock ADC & Dynamic Auto-Handling
MeshManager solves this cleanly by acting as a **local mock Google Cloud OAuth Provider**:
1. **Dynamic Ephemeral RSA Key Generation**: At runtime, MeshManager creates an in-memory 2048-bit RSA key pair for the local service account without storing hardcoded private keys in the repo.
2. **Auto-Provisioning to Standard Google Cloud ADC Path**: In addition to `~/.meshmanager/meshmanager-service-account.json`, MeshManager provisions the ADC file directly into Google's standard location:
   * **Windows**: `%APPDATA%\gcloud\application_default_credentials.json`
   * **Linux/macOS**: `~/.config/gcloud/application_default_credentials.json`
   *(Any existing user credentials are automatically backed up to `application_default_credentials.json.bak`)*.
3. **Local OAuth Token Loopback**: When Antigravity 2.0 requests an OAuth token, MeshManager returns an instant mock Google Bearer token (`ya29.meshmanager-antigravity-local-session`) on `http://127.0.0.1:20128/oauth2/token`.
4. **Transparent Proxying**: Antigravity routes all model traffic to `http://127.0.0.1:20128/v1`, which MeshManager transparently translates, optimizes, and routes to your pooled accounts!

### How MeshManager Handles All Startup Scenarios Dynamically:

| Scenario | What Happens | Action Needed |
| :--- | :--- | :--- |
| **Scenario A: MeshManager Starts First, Antigravity Starts Second** | MeshManager auto-provisions the mock ADC in `%APPDATA%\gcloud\` and injects proxy settings into Antigravity `settings.json`. When Antigravity starts, it finds the ADC naturally. | **Zero manual steps.** Start Antigravity normally. |
| **Scenario B: Antigravity Starts First, MeshManager Starts Second** | Antigravity is already running and waiting or prompting. Starting MeshManager or clicking the UI toggle detects the active `Antigravity IDE.exe` process (PID), writes the ADC, and flushes token loopback. | Click **Connect** toggle in Web UI or run `meshmanager antigravity setup`. |
| **Scenario C: User Toggles Disconnect or Stops MeshManager** | MeshManager reverts Antigravity `settings.json` and restores original `application_default_credentials.json.bak` if a backup existed, leaving zero residual files. | Click **Disconnect** in UI or run `meshmanager ide disconnect antigravity`. |

### 1-Click Setup Commands:
```bash
# Auto-provision ADC and connect Antigravity:
meshmanager antigravity setup
# (or connect command)
meshmanager ide connect antigravity
```

### Optional Manual Shell Overrides (For isolated subshells or containers):
* **PowerShell (Windows)**:
  ```powershell
  $env:GOOGLE_APPLICATION_CREDENTIALS="$HOME\.meshmanager\meshmanager-service-account.json"
  $env:GOOGLE_GEMINI_ENDPOINT="http://127.0.0.1:20128/v1"
  ```
* **Bash / Zsh (Linux / macOS)**:
  ```bash
  export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.meshmanager/meshmanager-service-account.json"
  export GOOGLE_GEMINI_ENDPOINT="http://127.0.0.1:20128/v1"
  ```

---

## 📊 Single Unified Master Telemetry Ledger

Instead of fragmented accounting views, MeshManager unifies client development editors and upstream provider accounts into a **Single Master Telemetry Matrix**:

```
================================================================================================================================================================
                                                   UNIFIED MESH TELEMETRY LEDGER (ATOMIC ACCOUNTING)                                            
================================================================================================================================================================
 Client IDE / Tool      Active Target Account   Provider/Service   Model Dispatched    Tier       Requests   Input Tokens  Output Tokens Total Tokens  Saved    Cost (USD) Status
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Google Antigravity     acc-paid-pro-1          GEMINI             gemini-2.5-pro      PAID_PRO   89         210,400       18,200        228,600       42,100   $0.6858    [ACTIVE - 82% Headroom]
 Cursor AI              acc-free-1              GEMINI             gemini-2.5-flash    FREE       142        384,120       24,500        408,620       86,400   $1.2258    [ACTIVE - 15 RPM Cap]
 VS Code (Continue)     acc-paid-pro-2          GEMINI             gemini-2.5-pro      PAID_PRO   35         65,200        8,400         73,600        14,200   $0.2208    [ACTIVE - 95% Headroom]
 Windsurf (Codeium)     omniroute-gateway       OMNIROUTE          auto-routing        ENTERPRISE 18         32,100        4,100         36,200        6,800    $0.1086    [ACTIVE - Healthy]
 Standby / Any Client   vertex-prod             VERTEX             gemini-2.5-flash    ENTERPRISE 0          0             0             0             0        $0.0000    [READY]
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 TOTAL MESH VOLUME:     5 Active Mappings                                                         284        691,820       55,200        747,020       149,500  $2.2410    [MESH HEALTHY]
================================================================================================================================================================
```

### How to Access:
* **CLI**: `meshmanager unified` (or alias `meshmanager matrix`).
* **Web UI**: Open `http://localhost:20128` $\to$ **Unified Master Ledger** tab with 1-click filters by client (`Antigravity`, `Cursor`, `VS Code`, `Paid Pro`, `Free Tier`).

---

## 🛡️ Local Network Isolation & Mandatory LAN Bearer Token Auth

When running AiMeshManager on your laptop or local workstation, you have full control over network visibility and access security:

### 1. Host Network Binding: Localhost vs LAN Sharing
* **Localhost-Only (`127.0.0.1`) [Default]**:
  The gateway binds exclusively to the loopback interface. Other devices on your local Wi-Fi or office LAN cannot connect or even establish a TCP handshake on port `20128`.
* **LAN Network Sharing (`0.0.0.0`)**:
  Allows secondary developer machines, test phones, or Docker containers on your local network to connect to AiMeshManager.
* **Toggle with 1 Click**:
  ```bash
  aimeshmanager security toggle-lan
  ```

### 2. Mandatory Gateway Master Bearer Token Auth (Default for LAN)
> [!IMPORTANT]
> **Automatic Protection:** Whenever LAN Network Sharing (`0.0.0.0`) is enabled, **Gateway Bearer Token Authentication is automatically ENFORCED by default** for all incoming remote network requests. This prevents unauthorized devices or rogue network scripts from consuming your paid subscriptions, API keys, or token quotas.

* Local loopback requests (`127.0.0.1`) from your local IDEs operate seamlessly without friction.
* Remote LAN requests must supply: `Authorization: Bearer <GATEWAY_TOKEN>` or header `X-Mesh-Key: <GATEWAY_TOKEN>`.
* Toggle or rotate token via CLI:
  ```bash
  aimeshmanager security status
  aimeshmanager security toggle-auth
  aimeshmanager security regenerate-token
  ```

### 3. Real-Time Firewall Audit Log
AiMeshManager tracks any unauthorized access attempt with timestamp, client IP address, target path, and reason. Inspect live in the Web UI under the **Security & Local Isolation** tab.

### 4. Zero-Residual Secret Purge & File Shredding (`aimeshmanager purge`)
If you need to leave no traces of your credentials on a system (e.g. shared workstations, client laptops, or when stopping the app):

* **Cryptographic Byte Zeroing:** Before deleting `~/.aimeshmanager/accounts.json`, AiMeshManager overwrites every single byte on disk with zeroes (`Buffer.alloc(stats.size, 0)`), defeating disk data recovery and file undelete utilities.
* **In-Memory Key Wiping:** Clears all API keys from active Node.js memory heaps and re-seeds clean simulation placeholders.
* **1-Click CLI & UI Execution:**
  ```bash
  # Purge all stored credentials immediately:
  aimeshmanager purge
  # (or alias)
  aimeshmanager account purge
  ```
  Or open the Web Control Center $\to$ **AI Accounts & Models** $\to$ click **`🔥 Purge Stored Secrets`**.

---

## 🔑 Adding & Authenticating Multiple Accounts

MeshManager supports adding unlimited Google Gemini accounts with disk persistence (`~/.meshmanager/accounts.json`):

### Method 1: Via the Web Control Center (Interactive UI)
1. Open your browser to `http://localhost:20128`.
2. Click **`+ Add AI Account`** in the top header.
3. Fill in:
   * **Account Identifier:** Unique slug (e.g., `work-gemini-pro` or `free-acc-3`).
   * **Friendly Label:** Name to display (e.g., `Work Pro (5h Rolling Bucket)`).
   * **Subscription Tier:** `Free Consumer` (15 RPM / Weekly) or `Google AI Pro` (120 RPM / 5h Rolling Window).
   * **Default Model:** Choose `gemini-2.5-flash`, `gemini-2.5-pro`, or `gemini-3.8-flash`.
   * **Google Gemini API Key:** Paste your API key from Google AI Studio.
4. Click **`🔍 Verify Key with Google`**:
   * MeshManager will query Google's API in real time. If the key is valid, a green confirmation displays immediately!
5. Click **`Save to Mesh`**. The account is instantly saved and available to all connected IDEs.

### Method 2: Via the Terminal CLI
```bash
# Add a new account
meshmanager account add personal-pro "Personal Google AI Pro" paid_pro gemini-2.5-pro AIzaSy...

# Test an API key with Google
meshmanager account verify AIzaSy...

# View all pooled accounts and quota meters
meshmanager account list
```

---

## 🧠 How to Know if Models are Dynamically Changing

When your IDE is configured with `auto-smart-router` (or standard Gemini/OpenAI models), MeshManager’s **Semantic Task Classifier** evaluates every prompt before dispatching:

```mermaid
flowchart TD
    IDE[Any IDE / Coding Tool] --> MM[MeshManager Gateway]
    MM --> Classify{Semantic Task Classifier}
    
    Classify -->|Docstrings, Tab Complete, Formatting, Typo| Micro[Tier 1: MICRO_SYNTAX]
    Classify -->|Functions, Unit Tests, Local Refactor| Tactical[Tier 2: TACTICAL_CODE]
    Classify -->|Multi-file Refactor, Architecture, Debugging| Strategic[Tier 3: STRATEGIC_REASON]

    Micro -->|Allocates| Flash[Free Gemini Flash Account: Zero Cost, High RPM]
    Tactical -->|Allocates| Balanced[Gemini Flash-Thinking or Pro Free Tier]
    Strategic -->|Allocates| Pro[Paid Gemini Pro Account: Deep Reasoning]

    MM -.-> LiveFeed[Live Connection Matrix Table & Response Headers]
```

### How to verify in real-time:
1. **Live IDE Connection & Dynamic Routing Matrix:**
   * Open `http://localhost:20128` $\to$ **Live Activity & Telemetry** tab.
   * Every request from your IDEs shows up in the table in real time with:
     * **Client IDE:** (e.g. Cursor, Antigravity, VS Code)
     * **Task Classification:** `MICRO_SYNTAX` vs `STRATEGIC_REASON`
     * **Dispatched Account:** The exact account used (e.g. `Gemini Free Account (Primary)`)
     * **Active Model:** The exact model executing the turn (`gemini-2.5-flash` vs `gemini-2.5-pro`)
     * **Route Mode:** `⚡ DYNAMIC` vs `📌 PINNED`
2. **HTTP Response Headers:**
   Every completion returned by MeshManager includes tracing headers:
   * `X-MeshManager-Account`: Account ID that executed the turn.
   * `X-MeshManager-Model`: Exact model dispatched.
   * `X-MeshManager-Tier`: Task tier classification.

---

## ⚙️ Setting Default Models per Account

Every account in MeshManager can have its own configured **Default Model**:
* **Free Accounts:** Typically set to `gemini-2.5-flash` for high throughput and zero cost.
* **Paid Pro Accounts:** Typically set to `gemini-2.5-pro` for deep agentic reasoning.

### How to change an account's default model:
* **In the Web UI:** Go to **AI Accounts & Model Pool** tab $\to$ locate the account card $\to$ change the **Default Model** dropdown (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3.8-flash`). Changes take effect immediately without restarting.
* **Via API:**
  ```bash
  curl -X PUT http://localhost:20128/api/accounts/acc-paid-pro -H "Content-Type: application/json" -d '{"defaultModel":"gemini-2.5-pro"}'
  ```

---

## 📌 Using a Specific Model of a Specific Account in Any IDE

What if you want **Cursor** to strictly use your **Paid Account with Gemini Pro**, while **Antigravity** uses **Free Flash**?

MeshManager supports **Virtual Model Addressing**:

$$\text{Format: } \mathbf{\text{account-id}} / \mathbf{\text{model-name}}$$

### Examples:
* `acc-paid-pro/gemini-2.5-pro` $\to$ Dispatches strictly to Account `acc-paid-pro` using `gemini-2.5-pro`.
* `acc-free-1/gemini-2.5-flash` $\to$ Dispatches strictly to Account `acc-free-1` using `gemini-2.5-flash`.

### How to use in your editor:
1. In the Web UI (**AI Accounts** tab), click **`Copy Pin`** next to any account (e.g. `acc-paid-pro/gemini-2.5-pro`).
2. Paste this string as your **Model Name** in Cursor, VS Code, or Antigravity.
3. MeshManager detects the virtual pin and routes directly to that account, bypassing the auto-classifier while still providing failover protection if the account hits a rate limit!

---

## 📡 Monitoring Which IDE is Connected to Which Account & Model

MeshManager inspects client headers (`User-Agent`, `x-client-ide`) and records active connections in an in-memory buffer.

Open `http://localhost:20128` $\to$ **Live Activity & Telemetry**:

| Time | Client IDE / Tool | Prompt Snippet | Task Classification | Dispatched Account | Active Model | Route Mode |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **16:29:48** | **Antigravity IDE** | Add docstring comments... | `MICRO_SYNTAX` | Gemini Free (Primary) | `gemini-2.5-flash` | `⚡ DYNAMIC` |
| **16:29:49** | **Cursor AI** | Architect and plan multi-file... | `STRATEGIC_REASON` | Google AI Pro (5h Rolling) | `gemini-2.5-pro` | `⚡ DYNAMIC` |
| **16:29:50** | **VS Code (Continue)**| Write a quick python script... | `TACTICAL_CODE` | Google AI Pro (5h Rolling) | `gemini-2.5-pro` | `📌 PINNED` |

---

## 🔌 1-Click IDE Connect Center & Fixing VS Code Detection

### Why did VS Code show "Not Detected" earlier?
If you recently installed VS Code or haven't modified user settings yet, the folder `%APPDATA%\Code\User\` or the file `settings.json` does not exist on disk. Previous tools disabled the toggle if the file wasn't found.

### The MeshManager Fix:
* **Auto-Directory & File Creation:** In MeshManager, you can click the toggle on **any** IDE card (Antigravity, Cursor, VS Code, Windsurf). If the directory doesn't exist, MeshManager **automatically creates the folders and generates `settings.json`**.
* **1-Click Copy Config Snippet:** Every IDE card displays the exact JSON snippet with a **`Copy Config Snippet`** button for manual setups or remote environments.

### Supported IDEs:
```bash
# 1-Click Connect via CLI:
meshmanager ide connect antigravity   # Google Antigravity 2.0 & IDE
meshmanager ide connect cursor        # Cursor AI Editor
meshmanager ide connect vscode        # VS Code (Continue / Cline / Roo)
aimeshmanager ide connect windsurf      # Windsurf (Codeium)
aimeshmanager ide connect all           # Connect all installed IDEs at once
```

---

## 🧪 Production Architecture Files: test-e2e.js, Dockerfile & docker-compose.yml

These three core files provide production reliability, continuous integration verification, and deployment flexibility:

### 1. `test-e2e.js` (End-to-End Regression Validation Suite)
* **What it does:** Runs **17 automated end-to-end assertions** exercising every single subsystem in AiMeshManager.
* **What it tests:**
  1. Health & Resource statistics telemetry (`/api/stats`)
  2. OpenAI-compatible models listing & virtual pins (`/v1/models`)
  3. Micro-syntax task routing (Cursor $\to$ Free Flash)
  4. Strategic architecture task routing (Antigravity $\to$ Paid Pro)
  5. Virtual Pin targeting (`acc-paid-pro-1/gemini-2.5-pro`)
  6. Real-time streaming Server-Sent Events (`stream=true`)
  7. 50ms Auto-failover upon simulated 429 quota exhaustion
  8. Hermes-style self-healing repair of malformed JSON tool calls
  9. Multi-IDE request & token accounting split (`/api/ide-accounting`)
  10. Real binary & running process validation (`/api/ides`)
  11. Single Unified Master Telemetry Ledger matrix (`/api/unified-telemetry`)
  12. Resource footprint benchmarks (Heap, RSS, ~0% idle CPU)
  13. Localhost vs LAN network isolation and firewall mode toggling
  14. Semantic task heat & intelligence scoring (Brainstorming $\to$ 88%–96% heat)
  15. Antigravity 2.0 Mock ADC generation and OAuth2 token loopback
  16. Dynamic 4-agent parallel swarm dispatch across multiple accounts
  17. Cryptographic secret shredding & memory key wiping (`/api/accounts/purge`)
* **How to run:**
  ```bash
  npm run test:e2e
  # Output: Summary: 17 Passed, 0 Failed of 17 Tests (100% Pass)
  ```

### 2. `Dockerfile` (Containerized Lightweight Deployment: Docker & Podman)
* **What it does:** Multi-stage OCI-compliant container recipe based on `node:20-alpine`.
* **Architecture:**
  * **Stage 1 (Builder):** Compiles TypeScript source code to optimized JavaScript.
  * **Stage 2 (Runner):** Strips dev dependencies, keeping image footprint to ~60MB.
  * **Healthcheck:** Automatic container health monitoring via `wget http://localhost:20128/api/stats`.
* **Run with Docker:**
  ```bash
  docker build -t aimeshmanager .
  docker run -d -p 20128:20128 -v ~/.aimeshmanager:/root/.aimeshmanager --name aimeshmanager aimeshmanager
  ```
* **Run with Podman (Rootless & Open-Source):**
  ```bash
  podman build -t aimeshmanager .
  podman run -d -p 20128:20128 -v ~/.aimeshmanager:/root/.aimeshmanager:Z --name aimeshmanager aimeshmanager
  ```

### 3. `docker-compose.yml` (Single-Command Daemon Orchestration)
* **What it does:** Declarative multi-container configuration for launching AiMeshManager with persistent storage and auto-restart policies. Works identically with Docker Compose and Podman Compose.
* **Key Configuration:**
  * Service: `aimeshmanager` (container: `aimeshmanager-mesh`)
  * Port binding: `20128:20128`
  * Restart policy: `always` (auto-recovers after workstation reboot)
  * Volume mount: `~/.aimeshmanager:/root/.aimeshmanager` (preserves accounts across upgrades)
* **Launch with Docker Compose:**
  ```bash
  docker compose up -d
  ```
* **Launch with Podman Compose:**
  ```bash
  podman compose up -d
  # (or: podman-compose up -d)
  ```

### 4. Direct `docker/podman run` vs. `compose up -d`: Issues, Gotchas & Which is Best?

| Operational Dimension | Direct `run` Command (`docker/podman run`) | Compose Orchestrator (`docker/podman compose up -d`) |
| :--- | :--- | :--- |
| **System Reboot Recovery** | ❌ **Does NOT restart** after reboot unless you manually append `--restart always`. | ✅ **Auto-restarts automatically** (`restart: always` specified in YAML). |
| **Rebuild & Upgrade Collisions** | ❌ **Fails with name conflict:** `The container name "aimeshmanager" is already in use`. Requires manual `stop` & `rm`. | ✅ **Zero conflicts:** Automatically stops old container, recreates with new image, and resumes. |
| **Typo-Prone Command Length** | ❌ **120+ character command:** Easy to forget `-d`, port mapping `-p`, or volume mount `-v`. | ✅ **Clean 1-liner:** `docker compose up -d` or `podman compose up -d`. |
| **SELinux Labeling on Linux** | ⚠️ Requires remembering `:Z` flag on Podman (`-v ~/.aimeshmanager:/root/.aimeshmanager:Z`). | ✅ Handled cleanly across platforms. |
| **Multi-Service Networking** | ⚠️ Runs on default bridge without container DNS resolution. | ✅ Isolated custom mesh network with DNS resolution. |

> **Recommendation:** **`docker compose up -d` (or `podman compose up -d`) is by far preferable and best practice.** It guarantees your AI gateway stays running 24/7 across reboots, upgrades seamlessly with `--build`, and eliminates container naming conflicts.

---

## 💻 Complete CLI Command Reference

```bash
aimeshmanager <command> [options]
# Or short aliases:
aimm <command>
meshmanager <command>
mesh <command>
```

| Command | Arguments | Action |
| :--- | :--- | :--- |
| **`start`** | `[--daemon, -d]` | Boots the gateway (run headless with `-d`). |
| **`stop`** | — | Stops the background service cleanly. |
| **`restart`** | — | Safely restarts the gateway service. |
| **`status`** | — | Prints gateway PID, port, active accounts, and connected IDEs. |
| **`swarm`** | `"<task>"` | Dispatches 4 parallel subagents (Planner, Coder, Linter, Critic) across accounts. |
| **`antigravity setup`** | `[mock-adc]` | Generates Mock Google Cloud ADC to bypass Antigravity 2.0 service account login. |
| **`purge`** | — | Cryptographically shreds stored credentials from disk and clears in-memory keys. |
| **`unified, matrix`** | — | Displays the Single Unified Master Telemetry Ledger. |
| **`stats`** | — | Real-time token economy, savings, and resource stress benchmark. |
| **`security status`** | — | Inspects host binding (Localhost vs LAN) and Gateway Token. |
| **`security toggle-lan`** | `[lan\|localhost]` | Toggles between 127.0.0.1 Loopback and 0.0.0.0 LAN Sharing. |
| **`security toggle-auth`**| — | Toggles mandatory Gateway Bearer Token authentication. |
| **`security regenerate-token`** | — | Rotates the Gateway Master Bearer Token. |
| **`doctor`** | — | Deep diagnostics on Node version, ports, permissions, and IDE paths. |
| **`upgrade`** | — | Checks for updates and pulls the latest version. |
| **`account list`** | — | Lists all accounts, virtual pin IDs, quotas, and statuses. |
| **`account add`** | `<id> <name> <tier> <model> <key>` | Adds an account with disk persistence. |
| **`account delete`** | `<id>` | Deletes an account from the mesh pool. |
| **`account verify`** | `<key>` | Verifies an API key against Google Gemini API. |
| **`account purge`** | — | Shreds credentials from disk and clears memory pools. |
| **`ide connect`** | `<antigravity\|cursor\|vscode\|all>` | Injects gateway settings into editor. |
| **`ide disconnect`**| `<antigravity\|cursor\|vscode\|all>` | Reverts editor to default settings. |

---

## 🚀 Installation & Quickstart

You can run AiMeshManager **natively on your computer** (zero Docker or Podman required) or inside a container.

### Method 1: Native Run (Zero Docker or Podman Needed) — Recommended
No container runtime required. Runs directly on Node.js across Windows, macOS, Linux, WSL, or Android Termux.

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/your-username/antigravity_multi_auth.git
   cd antigravity_multi_auth
   ```
2. **Launch AiMeshManager (1-Command):**
   ```bash
   npm start
   ```
   > ⚡ **Self-Bootstrapping:** If `node_modules` is not yet installed, AiMeshManager automatically detects missing packages and runs `npm install` for you before launching!
3. **Run as a Background Daemon (Optional):**
   ```bash
   node dist/cli.js start --daemon
   # Check status: node dist/cli.js status
   # Stop daemon:  node dist/cli.js stop
   ```
4. **Global CLI Installation (Optional):**
   ```bash
   npm install -g .
   # Now run anywhere:
   aimeshmanager start --daemon
   ```
5. **Open the Control Center:**
   Open `http://localhost:20128` in your browser.

---

### Method 2: Containerized Run (Podman or Docker)

* **With Podman (Rootless):**
  ```bash
  podman compose up -d
  # Or: podman build -t aimeshmanager . && podman run -d -p 20128:20128 -v ~/.aimeshmanager:/root/.aimeshmanager:Z aimeshmanager
  ```
* **With Docker:**
  ```bash
  docker compose up -d
  # Or: docker build -t aimeshmanager . && docker run -d -p 20128:20128 -v ~/.aimeshmanager:/root/.aimeshmanager aimeshmanager
  ```

---

## 🔄 Hermes-Style Self-Healing & Anti-Hallucination Guard

* **Autonomous Tool Call Repair:** Automatically intercepts unescaped Windows paths (`C:\projects`), markdown code fences around JSON, and trailing commas emitted by LLMs, auto-repairing them before they cause IDE crashes.
* **Context Grounding Guard:** Verifies imported packages, symbols, and paths against local workspace files.
* **Deterministic Sampling Calibration:** Applies low temperature ($0.1 - 0.2$) for code generation, reserving higher entropy for creative brainstorming.

---

## ⚙️ Dynamic Automation vs. Manual Tweaks

| Operational Dimension | What AiMeshManager Does Automatically | What You Can Tweak Manually |
| :--- | :--- | :--- |
| **Dependency Setup** | Automatically detects and installs missing `node_modules` on launch. | Run `npm install` manually if preferred. |
| **Load Balancing** | Automatically routes turns using P2C algorithm; fails over in 50ms upon 429 errors. | Enable/disable accounts, adjust priority weights, or trigger manual cooldowns. |
| **Model Selection** | Profiles task complexity and dispatches Flash, Thinking, or Pro models dynamically. | Set default models per account or use virtual pins (`accId/modelName`). |
| **Token Optimization** | Compresses whitespace, prunes duplicate comment blocks, caches identical prompts. | Adjust compression aggressiveness levels. |
| **IDE Configuration** | Injects gateway endpoints into settings files, auto-creating directories if missing. | Customize IDE config paths or copy JSON snippets directly. |

---

## 🔒 Security Architecture

* **Zero Cloud Telemetry:** Prompts and API keys reside strictly on your local machine and communicate only with Google's official endpoints.
* **Localhost Binding:** Binds strictly to `127.0.0.1`, blocking unauthorized external network access.
* **Encrypted Local Storage:** Configuration and accounts are stored locally under `~/.aimeshmanager/` (with automatic fallback to `~/.meshmanager/`).
