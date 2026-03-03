# Hooks

Trigger-based automation for the Cursor agent. Hooks run scripts at specific lifecycle events—before or after the agent takes action.

---

## Why Hooks?

**Hooks let you observe, control, and extend the agent loop** without changing how you interact with Cursor. They run automatically when certain events occur, so you can:

1. **Enforce consistency** — Run formatters, linters, or custom checks after every file edit so agent-written code matches your style.
2. **Add safety guards** — Block risky shell commands (e.g., `rm -rf`, `kubectl apply`), require approval for network calls, or prevent reads of sensitive files.
3. **Audit and observe** — Log what the agent does (commands run, files edited, MCP calls) for compliance, debugging, or analytics.
4. **Inject context** — Add project-specific env vars or system context at session start so the agent has the right environment.
5. **Gate operations** — Use `beforeReadFile` to block access to secrets or proprietary code; use `beforeSubmitPrompt` to scan for PII before prompts leave your machine.

Without hooks, you'd have to manually run formatters, remember to avoid risky commands, or track agent activity yourself. Hooks automate these concerns.

---

## When to Use Each Hook

| Hook | When it runs | Use it for |
|------|--------------|------------|
| `sessionStart` | New composer session opens | Inject env vars, add context, block session if policy violated |
| `sessionEnd` | Session closes | Log duration, send analytics, cleanup |
| `beforeSubmitPrompt` | User hits send, before request | Scan prompt for secrets/PII, block if policy violated |
| `beforeShellExecution` | Before any shell command runs | Approve/deny commands, log, block risky ops (rm, network) |
| `afterShellExecution` | After shell command completes | Log output, run post-command checks |
| `beforeMCPExecution` | Before MCP tool runs | Gate MCP access, log tool usage |
| `afterMCPExecution` | After MCP tool completes | Audit MCP results |
| `beforeReadFile` | Before agent reads a file | Block sensitive files, redact content |
| `afterFileEdit` | After agent edits a file | Run formatter, linter, or custom checks |
| `stop` | When agent loop ends | Log completion, optionally auto-submit follow-up message |

---

## How to Use Hooks: Examples

### Example 1: Format Code After Every Edit

**When:** The agent writes code that doesn't match your Prettier/ESLint config.

**How:** Use `afterFileEdit` to run your formatter automatically.

```json
// hooks.json
{
  "version": 1,
  "hooks": {
    "afterFileEdit": [
      {"command": ".github/workflows/format.sh", "timeout": 10}
    ]
  }
}
```

`format.sh` receives the edited file path via stdin and runs `npx prettier --write <path>`. No manual formatting needed.

---

### Example 2: Block Risky Shell Commands

**When:** You want to prevent the agent from running `rm -rf`, `DROP TABLE`, or `kubectl apply` without review.

**How:** Use `beforeShellExecution` with a script that returns `permission: "deny"` for dangerous patterns.

```json
{
  "hooks": {
    "beforeShellExecution": [
      {
        "command": ".github/workflows/block-risky.sh",
        "timeout": 5,
        "matcher": "rm -rf|DROP |kubectl apply"
      }
    ]
  }
}
```

Create `block-risky.sh` that reads the command from stdin, checks against a blocklist, and outputs `{"permission":"deny","user_message":"This command is blocked by policy"}` when matched.

---

### Example 3: Audit All Agent Activity

**When:** You need a log of what the agent did (for compliance, debugging, or team visibility).

**How:** Use `audit.sh` on multiple events—`beforeShellExecution`, `afterFileEdit`, `stop`—to log to a file or forward to a service.

```json
{
  "hooks": {
    "beforeShellExecution": [{"command": ".github/workflows/audit.sh"}],
    "afterFileEdit": [{"command": ".github/workflows/audit.sh"}],
    "stop": [{"command": ".github/workflows/audit.sh"}]
  }
}
```

`audit.sh` parses the JSON input, extracts the event type and relevant data, and appends to `audit.log` or sends to your logging backend.

---

### Example 4: Inject Project Context at Session Start

**When:** The agent needs project-specific env vars (API keys, feature flags) or extra context to work correctly.

**How:** Use `sessionStart` to return `env` and/or `additional_context`.

```json
{
  "hooks": {
    "sessionStart": [
      {"command": ".github/workflows/session-init.sh", "timeout": 5}
    ]
  }
}
```

`session-init.sh` can read `.env.local`, output `{"env":{"MY_API_KEY":"..."},"additional_context":"Current sprint: Q1. Focus on auth."}` so the agent has the right environment.

---

### Example 5: Block Access to Sensitive Files

**When:** You have secrets, keys, or proprietary code that should never be sent to the model.

**How:** Use `beforeReadFile` to return `permission: "deny"` for matching paths.

```json
{
  "hooks": {
    "beforeReadFile": [
      {
        "command": ".github/workflows/block-sensitive.sh",
        "timeout": 5
      }
    ]
  }
}
```

`block-sensitive.sh` receives `file_path` in the input, checks against a list (e.g., `*.pem`, `.env*`, `secrets/`), and returns `{"permission":"deny"}` when matched.

---

### Example 6: Require Approval for Network Commands

**When:** You want to approve `curl`, `wget`, or `npm install` before they run.

**How:** Use `beforeShellExecution` with a `matcher` so the hook only runs for network-related commands.

```json
{
  "hooks": {
    "beforeShellExecution": [
      {
        "command": ".github/workflows/approve-network.sh",
        "timeout": 30,
        "matcher": "curl |wget |npm install"
      }
    ]
  }
}
```

The hook can return `{"permission":"ask"}` to prompt the user, or `{"permission":"allow"}` to auto-approve in trusted contexts.

---

## Available Scripts (Included)

| Script | Events | Purpose |
|--------|--------|---------|
| `format.sh` | afterFileEdit | Runs Prettier on edited files (if available) |
| `audit.sh` | beforeShellExecution, afterShellExecution, sessionEnd, stop | Logs events to `.github/workflows/audit.log` |
| `session-init.sh` | sessionStart | Session setup (inject env, context, or block) |

---

## Alignment with Compounding Development Cycle

This project follows **Plan → Code → Review/Test → Plan** (see `.github/copilot-instructions.md and .github/instructions/compounding-dev-cycle.md`). Hooks are configured to support that cycle:

| Hook / script | How it supports the cycle |
|---------------|---------------------------|
| **sessionStart** → `session-init.sh` | Injects reminder context so agents follow the cycle: plan first (feature-plan), code to the plan, hand off with implementation notes; plan doc is the single source of truth. |
| **afterFileEdit** → `format.sh` | Keeps Code-phase output consistent with `core-standards.md` (style, formatting) so Review/Test sees clean diffs. |
| **sessionEnd** → `audit.sh` | Logs session end in `audit.log` so session boundaries are visible; supports traceability and handoff between sessions. |
| **beforeShellExecution** / **afterShellExecution** / **stop** → `audit.sh` | Logs commands (before/after) and loop end to `audit.log` for traceability (what ran, when), supporting handoff and rework follow-up. |

No hooks run automatically for Review/Test or for creating plan docs—those are driven by commands (e.g. feature-plan, project-manager) and agents (backend-reviewer, frontend-reviewer). E2E is user-triggered.

## Configuration

`hooks.json` maps events to scripts. Paths are relative to the project root. Add `timeout` (seconds) and `matcher` (regex for filtering) as needed.

## Customization

1. Edit `hooks.json` to add/remove hooks or change timeouts
2. Modify scripts to fit your workflow
3. Make scripts executable: `chmod +x .github/workflows/*.sh`

## Debugging

- Check Cursor Settings → Hooks tab for execution status
- Use the Hooks output channel for errors
- Restart Cursor after changing hooks
