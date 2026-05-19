# Developer Guide: Plan-Code-Review Workflow

This guide explains how the extension is set up, why certain folders are or aren’t in the repo, and how to change or extend it.

---

## 1. Architecture overview

The extension does two things:

1. **Ships assistant-specific workflow trees** — Rules, agents, skills, commands, and hooks live under **`workflow/`** in separate trees: **`workflow/cursor/`**, **`workflow/claude/`**, **`workflow/copilot/`**, **`workflow/codex/`**. The Cursor plugin manifest is **`workflow/cursor-plugin/`** (paths inside point to `.cursor/` when copied to the workspace).
2. **Adapts each tree to the workspace** — When you run **Apply workflow for…**, the corresponding adapter reads **only** from its tree (e.g. `extensionPath/workflow/claude/`) and copies or syncs into the **user’s workspace** (or user-level config) so that assistant can use the workflow.

There is **no single source of truth** that gets converted: each assistant has its own tailored structure and content under `workflow/<assistant>/`.

---

## 2. Why we don’t add the `.claude` folder (and similar) to the repo

We **do not** commit `.claude/`, `.github/copilot-instructions.md`, or user-specific `AGENTS.md` **into the extension repo as pre-built outputs** because:

- **Separate configs per assistant** — Each assistant’s content lives under `workflow/<assistant>/`. The extension **ships** those trees and adapters **copy or sync** them into the user’s workspace (or user dir). Generated files (`.claude/`, `.github/`, `AGENTS.md`, `~/.codex/skills`) are created at apply time in the **user’s** project or home dir.
- **Workspace-owned** — Those generated files are meant to live in the project the user is working on (or their profile), so they can be committed, shared, or gitignored as needed. They don’t belong in the extension’s own repo.
- **No stale copies** — Shipping pre-built `.claude/` or `.github/` in the repo would duplicate `workflow/claude/` and `workflow/copilot/`. Reading from `workflow/<assistant>/` at apply-time keeps the user’s copy in sync with the extension.

So: **we don’t add `.claude` (or Copilot/Codex-generated folders) to the repo**; we add the **source trees** under `workflow/` and the adapter logic in `src/adapters/` that copy them into the user’s workspace.

---

## 3. What _is_ in the repo (and the extension package)

| Path                      | Purpose                                                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workflow/cursor/`        | Cursor-only rules, agents, skills, commands, hooks. **Shipped in the extension**; Cursor adapter copies to workspace `.cursor/`.                                                  |
| `workflow/claude/`        | Claude-only agents, rules, skills, hooks, CLAUDE.md. Adapter copies to workspace `.claude/` and `CLAUDE.md` (or `~/.claude/`).                                                    |
| `workflow/copilot/`       | Copilot/GitHub layout: copilot-instructions.md, instructions/, agents/, workflows/, AGENTS.md, user-instructions.md. Adapter copies to workspace `.github/` and root `AGENTS.md`. |
| `workflow/codex/`         | Codex skills and AGENTS.md (workspace + user). Adapter syncs skills to `~/.codex/skills/` and writes AGENTS.md.                                                                   |
| `workflow/cursor-plugin/` | Cursor plugin manifest (e.g. `plugin.json`). **Shipped in the extension**; Cursor adapter copies to workspace `.cursor-plugin/`. Paths inside reference `.cursor/` (destination). |
| `src/adapters/`           | Adapter logic: each reads from `extensionPath/workflow/<assistant>/` only, writes assistant-specific files into the workspace or user dir.                                        |
| `src/extension.ts`        | VS Code extension entry: commands and wiring to adapters.                                                                                                                         |

The extension **must** include `workflow/**` in its package. If `workflow/**` is excluded via `.vscodeignore`, apply commands fail with "Extension workflow files not found" and no `.claude`, `.github`, or Codex files are created. The **shipped** source for Cursor apply is `workflow/cursor/` and `workflow/cursor-plugin/`.

---

## 4. Packaging: `.vscodeignore`

When you run `vsce package`, the default is to include all files except those matched by `.vscodeignore` (and often `.gitignore`).

- **We must not exclude** `workflow/**`. If it is in `.vscodeignore`, the packaged extension won’t contain the workflow trees (including `workflow/cursor-plugin/`), and **Apply workflow for…** will not create `.cursor`, `.claude`, `.github`, or Codex files.
- **We do exclude** `src/**` (TypeScript source); the built output lives in `out/`. We also exclude dev-only files (`tsconfig.json`, `node_modules`, `docs/`, etc.) as needed.

So: **we don’t add pre-built `.claude` or `.github` to the repo**; we ship **`workflow/`** and ensure it is _not_ ignored so the package contains the four trees and adapters can copy them into the user’s workspace.

---

## 5. How adapters work

- **Detection** (`src/adapters/detect.ts`) — Determines which AI assistants are available (Cursor app name, or extensions like `Anthropic.claude-code`, `GitHub.copilot`, `openai.chatgpt`).
- **Apply** — Each adapter receives `AdapterContext`: `extensionPath` (extension root; workflow trees under `workflow/<assistant>/`), `workspaceRootPath` (the first workspace folder), and optional install targets (e.g. `claudeInstallTarget`, `cursorInstallTarget`, `codexInstallTarget`). Each adapter reads **only** from `extensionPath/workflow/<assistant>/` (and for Cursor, `workflow/cursor-plugin/` for the plugin manifest) and writes into `workspaceRootPath` (e.g. `.cursor/`, `.claude/`, `.github/`, `AGENTS.md`) or, for user-level apply, into the user’s home dir (e.g. `~/.claude/`, `~/.codex/`).

So:

- **Cursor adapter** — Copies `extensionPath/workflow/cursor` to `workspaceRootPath/.cursor/` and `extensionPath/workflow/cursor-plugin` to `workspaceRootPath/.cursor-plugin/`.
- **Claude adapter** — Copies `extensionPath/workflow/claude/` (agents, rules, skills, hooks, CLAUDE.md) to `workspaceRootPath/.claude/` and `CLAUDE.md` (or to `~/.claude/` for user install).
- **Copilot adapter** — Copies `extensionPath/workflow/copilot/` to workspace `.github/` and root `AGENTS.md`; user-level instructions from `workflow/copilot/user-instructions.md` to the IDE prompts folder.
- **Codex adapter** — Syncs `extensionPath/workflow/codex/skills/` to `~/.codex/skills/`; writes workspace and user `AGENTS.md` from `workflow/codex/` (e.g. `AGENTS.md`, `user/AGENTS.md`).

**Codex and rules:** Codex has no separate “rules” folder; rules live in the AGENTS.md content in `workflow/codex/`. See [Codex customization](https://developers.openai.com/codex/guides/agents-md).

All of this happens in the user’s workspace (or user dir) when they run the command; the repo only holds the **source trees** under `workflow/` and the adapter code.

---

## 6. Changing the workflow or adding an adapter

- **Change rules, agents, skills, commands, hooks** — Edit files under **`workflow/<assistant>/`** for the assistant you want to change (e.g. `workflow/cursor/`, `workflow/claude/`, `workflow/copilot/`, `workflow/codex/`). The Cursor plugin manifest is **`workflow/cursor-plugin/`**. Rebuild and repackage the extension; the next **Apply workflow for…** will use the updated content.
- **Add a new AI assistant** — Add a new directory under `workflow/<new-assistant>/` with the structure that assistant expects, add an adapter in `src/adapters/` that implements `WorkflowAdapter`, register it in `src/adapters/index.ts`, and add a command in `src/extension.ts` and `package.json`. Document the assistant’s config format and map from `workflow/<new-assistant>/` to the workspace or user dir.
- **Adjust what gets written** — Edit the corresponding adapter (e.g. `claude.ts`) to copy or sync more or fewer files from its `workflow/<assistant>/` tree.

---

## 7. Testing and releasing

- **Local test** — Open this repo as the workspace, run **Apply workflow for Claude Code** (or another). Check that `.claude/`, `CLAUDE.md`, etc. appear at the repo root and look correct.
- **Package test** — Run `npm run compile` then `vsce package`. Install the resulting `.vsix` in a clean profile, open another folder, run **Apply workflow for Claude Code**. Confirm `.claude` and other files are created there.
- **Release** — Bump version in `package.json`, update `CHANGELOG.md`, then publish to the marketplace and/or Open VSX as in `VSCODE-EXTENSION-PUBLISHING.md`.

---

## 8. Quick reference

| Question                                          | Answer                                                                                                                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Why is there no `.claude` in the repo?            | `.claude` is created in the user’s workspace (or `~/.claude/`) by the Claude adapter when you run **Apply workflow for Claude Code**. The repo holds the **source** in `workflow/claude/`.                      |
| Why must `workflow/` be in the extension package? | Adapters read from `extensionPath/workflow/<assistant>/` to copy or sync content; if `workflow/**` is excluded via `.vscodeignore`, the package has no workflow trees and apply commands fail.                  |
| Where does `.claude` get created?                 | When you run **Apply workflow for Claude Code**, you choose **project root** (first workspace folder: `.claude/`, `CLAUDE.md`) or **user directory** (`~/.claude/`). Content is copied from `workflow/claude/`. |
| Where do I edit rules/agents for each assistant?  | Edit **`workflow/cursor/`**, **`workflow/claude/`**, **`workflow/copilot/`**, or **`workflow/codex/`** depending on which assistant you want to change. See README “Customization” and the table in §3 above.   |

---

For end-user installation and usage, see **README.md**. For publishing the extension, see **VSCODE-EXTENSION-PUBLISHING.md** and **PUBLISHING.md**.
