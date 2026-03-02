# Developer Guide: Plan-Code-Review Workflow

This guide explains how the extension is set up, why certain folders are or aren’t in the repo, and how to change or extend it.

---

## 1. Architecture overview

The extension does two things:

1. **Ships a canonical workflow** — rules, agents, skills, commands, and hooks — in `.cursor/` and `.cursor-plugin/` inside the extension package.
2. **Adapts that workflow** to different AI assistants (Cursor, Claude Code, GitHub Copilot, Codex) when you run **Apply workflow for…**. Each adapter writes the right files into the **user’s workspace** (or user-level config) so that assistant can use the same workflow.

So there is **one source of truth** (`.cursor/` and `.cursor-plugin/`) and **generated, assistant-specific config** created on demand.

---

## 2. Why we don’t add the `.claude` folder (and similar) to the repo

We **do not** commit `.claude/`, `.github/copilot-instructions.md`, `.agents/`, or user-specific `AGENTS.md` to this repo because:

- **Single source of truth** — The canonical workflow lives in `.cursor/` and `.cursor-plugin/`. Claude-, Copilot-, and Codex-specific layout is **derived** from that. Adding `.claude/` to the repo would duplicate content and create two sources of truth that can drift.
- **Generated on demand** — The extension **generates** `.claude/`, `CLAUDE.md`, `.github/copilot-instructions.md`, `AGENTS.md`, etc. when the user runs **Apply workflow for Claude Code** (or Copilot, Codex, Cursor). For Codex, `.agents/skills/` is no longer created; skills sync to `~/.codex/skills`. Other generated files are written into the **user’s workspace**, not into the extension repo.
- **Workspace-owned** — Those files are meant to live in the project the user is working on, so they can be committed there, shared with the team, or gitignored as needed. They don’t belong in the extension’s own repo.
- **No stale copies** — If we shipped a pre-built `.claude/` in the extension, it would be a snapshot. Generating from `.cursor/` at apply-time keeps Claude (and others) in sync with the current rules and agents.

So: **we don’t add `.claude` (or Copilot/Codex-specific folders) to the repo**; we add the logic that creates them in the user’s workspace (the adapters in `src/adapters/`).

---

## 3. What *is* in the repo (and the extension package)

| Path | Purpose |
|------|--------|
| `.cursor/` | Canonical rules, agents, skills, commands, hooks. **Shipped in the extension** so adapters can read from it. |
| `.cursor-plugin/` | Cursor plugin manifest (e.g. `plugin.json`). **Shipped in the extension**; Cursor adapter copies it to the workspace. |
| `src/adapters/` | Adapter logic: read from `.cursor/` (and `.cursor-plugin/`), write assistant-specific files into the workspace. |
| `src/extension.ts` | VS Code extension entry: commands and wiring to adapters. |

The extension **must** include `.cursor/` and `.cursor-plugin/` in its package so that when a user runs **Apply workflow for Claude Code** (or Cursor, etc.), the adapter can read `extensionPath/.cursor/agents`, etc. If those folders are excluded at package time, the adapters fail with “Extension workflow files not found” and no `.claude` (or other) folder is created.

---

## 4. Packaging: `.vscodeignore`

When you run `vsce package`, the default is to include all files except those matched by `.vscodeignore` (and often `.gitignore`).

- **We must not exclude** `.cursor/**` or `.cursor-plugin/**`. If those are in `.vscodeignore`, the packaged extension won’t contain the workflow, and **Apply workflow for Claude Code** (and the other adapters) will not create `.claude` or any other target files.
- **We do exclude** `src/**` (TypeScript source); the built output lives in `out/` and is what gets run. We also exclude dev-only files (`tsconfig.json`, `node_modules`, `docs/`, etc.).

So the developer guide reason is: **we don’t add a `.claude` folder to the repo, but we do ensure `.cursor` and `.cursor-plugin` are *not* ignored so the extension package contains them and the adapters can generate `.claude` (and the rest) in the user’s workspace.**

---

## 5. How adapters work

- **Detection** (`src/adapters/detect.ts`) — Determines which AI assistants are available (Cursor app name, or extensions like `Anthropic.claude-code`, `GitHub.copilot`, `openai.chatgpt`).
- **Apply** — Each adapter receives `AdapterContext`: `extensionPath` (where the extension is installed), `workspaceRootPath` (the first workspace folder), and for Claude optionally `claudeInstallTarget` (`"project"` or `"user"`). It reads from `extensionPath/.cursor/` (and optionally `.cursor-plugin/`) and writes into `workspaceRootPath` (e.g. `.claude/`, `CLAUDE.md`, `.github/`, `AGENTS.md`, `.agents/`) or, for Claude with `claudeInstallTarget === "user"`, into `~/.claude/`.

So:

- **Cursor adapter** — Copies `extensionPath/.cursor` and `extensionPath/.cursor-plugin` into `workspaceRootPath`.
- **Claude adapter** — When **project**: creates `workspaceRootPath/.claude/agents/` (from `.cursor/agents`), `workspaceRootPath/.claude/rules/` (from `.cursor/rules`; includes compounding dev cycle), `workspaceRootPath/.claude/skills/` (from `.cursor/skills`), `workspaceRootPath/CLAUDE.md` (from `.cursor/rules`), and optionally `.claude/hooks/` and `.claude/settings.json`. When **user** (chosen via QuickPick at apply time): same structure under `~/.claude/` (e.g. `~/.claude/agents/`, `~/.claude/rules/`, `~/.claude/skills/`, `~/.claude/CLAUDE.md`), so the workflow applies to all projects. The layout follows **Claude Code’s official project/user scope**: project scope uses `.claude/settings.json` and `CLAUDE.md` at repo root; user scope uses `~/.claude/settings.json` and `~/.claude/CLAUDE.md`. Claude Code also loads modular rules from `.claude/rules/` and skills from `.claude/skills/`. Hook commands use `$CLAUDE_PROJECT_DIR/.claude/hooks/…` for project scope and an absolute path to `~/.claude/hooks/…` for user scope.
- **Copilot adapter** — Writes **user-level** instructions: **rules, agents, and skills** to the VS Code/Cursor **prompts** folder as `plan-code-review-workflow.instructions.md` (applyTo: `"**"`) so they apply to all chats in all workspaces. In the workspace, creates **`.github/`** with: **`copilot-instructions.md`** (rules); **`agents/`** — each agent from `.cursor/agents/*.md` as **`<name>.agent.md`** with inlined skills; **`workflows/`** — hooks (hooks.json, README, format/audit/session-init scripts); **`ISSUE_TEMPLATE/`** — structured prompts (feature, bug report, review request). Writes **`AGENTS.md`** at repo root with the compounding dev cycle and custom-agent reference. Remove deletes only extension-written files and empty `.github` subdirs.
- **Codex adapter** — Writes **user-level** **~/.codex/AGENTS.md** with the compounding dev cycle so it applies in all projects. Syncs `extensionPath/.cursor/skills` to `~/.codex/skills`. Writes `workspaceRootPath/AGENTS.md` (full rules + agent summaries). Does not create `.agents/skills` in the workspace.

All of this happens in the user’s workspace when they run the command; nothing in the repo is a pre-built `.claude` or Copilot/Codex tree.

---

## 6. Changing the workflow or adding an adapter

- **Change rules, agents, skills, commands, hooks** — Edit files under `.cursor/` and `.cursor-plugin/`. Rebuild and repackage the extension; the next **Apply workflow for…** will use the updated content.
- **Add a new AI assistant** — Add a new adapter in `src/adapters/` (e.g. `myassistant.ts`) that implements the `WorkflowAdapter` interface, then register it in `src/adapters/index.ts` and add a command in `src/extension.ts` and `package.json`. Document the assistant’s config format (where it expects rules, agents, etc.) and map from `.cursor/` to that layout.
- **Adjust what gets generated** — Edit the corresponding adapter (e.g. `claude.ts`) to write more or fewer files, or a different structure, still using `.cursor/` (and `.cursor-plugin/` if needed) as the source.

---

## 7. Testing and releasing

- **Local test** — Open this repo as the workspace, run **Apply workflow for Claude Code** (or another). Check that `.claude/`, `CLAUDE.md`, etc. appear at the repo root and look correct.
- **Package test** — Run `npm run compile` then `vsce package`. Install the resulting `.vsix` in a clean profile, open another folder, run **Apply workflow for Claude Code**. Confirm `.claude` and other files are created there.
- **Release** — Bump version in `package.json`, update `CHANGELOG.md`, then publish to the marketplace and/or Open VSX as in `VSCODE-EXTENSION-PUBLISHING.md`.

---

## 8. Quick reference

| Question | Answer |
|----------|--------|
| Why is there no `.claude` in the repo? | `.claude` is generated in the user’s workspace by the Claude adapter; the repo only holds the adapter code and the canonical `.cursor/` content. |
| Why must `.cursor` be in the extension package? | Adapters read from `extensionPath/.cursor/` to generate assistant-specific files; if `.cursor` is excluded via `.vscodeignore`, the package has no workflow and apply commands fail. |
| Where does `.claude` get created? | When you run **Apply workflow for Claude Code**, you choose: **project root** (first workspace folder: `.claude/`, `CLAUDE.md`) or **user directory** (`~/.claude/`). Both use the same structure: `.claude/agents/`, `.claude/rules/`, `.claude/skills/`, `.claude/settings.json`, `.claude/hooks/`, and `CLAUDE.md` (at project root or inside `~/.claude/`). |
| Can I add a pre-built `.claude` for convenience? | Not recommended; it would duplicate and can drift from `.cursor/`. Prefer improving the Claude adapter so it generates everything needed from `.cursor/`. |

---

For end-user installation and usage, see **README.md**. For publishing the extension, see **VSCODE-EXTENSION-PUBLISHING.md** and **PUBLISHING.md**.
