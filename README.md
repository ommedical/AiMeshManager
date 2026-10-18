# ⚡ MeshManager

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
2. [Adding & Authenticating Multiple Accounts](#-adding--authenticating-multiple-accounts)
3. [How to Know if Models are Dynamically Changing](#-how-to-know-if-models-are-dynamically-changing)
4. [Setting Default Models per Account](#-setting-default-models-per-account)
5. [Using a Specific Model of a Specific Account in Any IDE (Virtual Pins)](#-using-a-specific-model-of-a-specific-account-in-any-ide)
6. [Monitoring Which IDE is Connected to Which Account & Model](#-monitoring-which-ide-is-connected-to-which-account--model)
7. [1-Click IDE Connect Center & Fixing VS Code Detection](#-1-click-ide-connect-center--fixing-vs-code-detection)
8. [Complete CLI Command Reference](#-complete-cli-command-reference)
9. [Installation & Quickstart](#-installation--quickstart)
10. [Hermes-Style Self-Healing & Anti-Hallucination Guard](#-hermes-style-self-healing--anti-hallucination-guard)
11. [Dynamic Automation vs. Manual Tweaks](#-dynamic-automation-vs-manual-tweaks)

---

## 🎯 Overview & Core Philosophy

**MeshManager** serves as an intelligent local gateway between all your development environments (Antigravity IDE/2.0, Cursor, VS Code, Windsurf, JetBrains) and your AI accounts.

It solves quota anxiety, rate limit crashes, and token waste by:
* **Pooling multiple accounts:** Stacks multiple Free (`@gmail.com`) accounts and Paid (Google AI Pro, Ultra, Enterprise) subscriptions.
* **Auto-failing over in 50ms:** When one account hits a 429 rate limit or quota ceiling, MeshManager seamlessly routes in-flight turns to a backup account without dropping IDE context.
* **Dynamic Model Allocation:** Automatically inspects task complexity and routes micro-tasks to free fast models and complex architecture tasks to deep reasoning models.
* **Pinning specific models to specific accounts:** Allows binding an editor to a specific account and model (e.g. `acc-paid-pro/gemini-2.5-pro`).

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
meshmanager ide connect windsurf      # Windsurf (Codeium)
meshmanager ide connect all           # Connect all installed IDEs at once
```

---

## 💻 Complete CLI Command Reference

```bash
meshmanager <command> [options]
# Or short alias:
mesh <command>
```

| Command | Arguments | Action |
| :--- | :--- | :--- |
| **`start`** | `[--daemon, -d]` | Boots the gateway (run headless with `-d`). |
| **`stop`** | — | Stops the background service cleanly. |
| **`restart`** | — | Safely restarts the gateway service. |
| **`status`** | — | Prints gateway PID, port, active accounts, and connected IDEs. |
| **`upgrade`** | — | Checks for updates and pulls the latest version. |
| **`doctor`** | — | Deep diagnostics on Node version, ports, permissions, and IDE paths. |
| **`stats`** | — | Real-time token economy and cost savings report. |
| **`account list`** | — | Lists all accounts, virtual pin IDs, quotas, and statuses. |
| **`account add`** | `<id> <name> <tier> <model> <key>` | Adds an account with disk persistence. |
| **`account delete`** | `<id>` | Deletes an account from the mesh pool. |
| **`account verify`** | `<key>` | Verifies an API key against Google Gemini API. |
| **`ide connect`** | `<antigravity\|cursor\|vscode\|all>` | Injects gateway settings into editor. |
| **`ide disconnect`**| `<antigravity\|cursor\|vscode\|all>` | Reverts editor to default settings. |

---

## 🚀 Installation & Quickstart

```bash
# 1. Install dependencies & build
npm install
npm run build

# 2. Launch MeshManager in the background
node dist/cli.js start --daemon

# 3. Open the Web Control Center
# In your browser: http://localhost:20128
```

---

## 🔄 Hermes-Style Self-Healing & Anti-Hallucination Guard

* **Autonomous Tool Call Repair:** Automatically intercepts unescaped Windows paths (`C:\projects`), markdown code fences around JSON, and trailing commas emitted by LLMs, auto-repairing them before they cause IDE crashes.
* **Context Grounding Guard:** Verifies imported packages, symbols, and paths against local workspace files.
* **Deterministic Sampling Calibration:** Applies low temperature ($0.1 - 0.2$) for code generation, reserving higher entropy for creative brainstorming.

---

## ⚙️ Dynamic Automation vs. Manual Tweaks

| Operational Dimension | What MeshManager Does Automatically | What You Can Tweak Manually |
| :--- | :--- | :--- |
| **Load Balancing** | Automatically routes turns using P2C algorithm; fails over in 50ms upon 429 errors. | Enable/disable accounts, adjust priority weights, or trigger manual cooldowns. |
| **Model Selection** | Profiles task complexity and dispatches Flash, Thinking, or Pro models dynamically. | Set default models per account or use virtual pins (`accId/modelName`). |
| **Token Optimization** | Compresses whitespace, prunes duplicate comment blocks, caches identical prompts. | Adjust compression aggressiveness levels. |
| **IDE Configuration** | Injects gateway endpoints into settings files, auto-creating directories if missing. | Customize IDE config paths or copy JSON snippets directly. |

---

## 🔒 Security Architecture

* **Zero Cloud Telemetry:** Prompts and API keys reside strictly on your local machine and communicate only with Google's official endpoints.
* **Localhost Binding:** Binds strictly to `127.0.0.1`, blocking unauthorized external network access.
* **Encrypted Local Storage:** Configuration and accounts are stored locally under `~/.meshmanager/`.
