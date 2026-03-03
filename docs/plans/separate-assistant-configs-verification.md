# Manual verification: Separate Assistant Configs

Use this checklist to verify apply/remove and packaging for the separate-assistant-configs refactor. See [separate-assistant-configs.md](./separate-assistant-configs.md) for the full plan.

## Automated script (Apply/Remove to temp workspace)

From repo root after `npm run compile`:

```bash
node scripts/verify-apply-remove.js
```

This runs **Apply** for Cursor, Claude, and Copilot to a temp directory, verifies destinations match the workflow trees, then runs **Remove** for each (manifest-based). It also checks that `workflow/codex/skills/` and `workflow/codex/AGENTS.md` exist. Codex apply is not run (it writes to `~/.codex`); verify Codex in the IDE.

**Last run:** Passed — Apply Cursor/Claude/Copilot and Remove Cursor/Claude/Copilot succeeded; Codex source tree present.

## Prerequisites

- Node/npm available for `npm run compile` and `vsce package`.
- VS Code (or Cursor) with a **clean profile** for the VSIX install step (or a test workspace you can reset).

---

## 1. Apply each assistant (packaged extension)

Run from a **packaged** install (VSIX or already installed extension). Use **Apply workflow for…** (or the specific command per assistant) and confirm destinations match the workflow trees.

| Step | Action | Verify |
|------|--------|--------|
| 1.1 | **Apply Cursor** to a clean workspace | Workspace has `.cursor/` and `.cursor-plugin/`; content matches `workflow/cursor/` and plugin dir (e.g. `.cursor-plugin/` or repo root). |
| 1.2 | **Apply Claude** (project or user) | `.claude/` and `CLAUDE.md` match `workflow/claude/`; no `.cursor/` paths in generated files. |
| 1.3 | **Apply Copilot** | `.github/copilot-instructions.md`, `.github/instructions/`, `.github/agents/*.agent.md`, `.github/workflows/`, root `AGENTS.md` match or derive from `workflow/copilot/` only. |
| 1.4 | **Apply Codex** | `~/.codex/skills/` and workspace/user `AGENTS.md` come from `workflow/codex/`; no `.cursor/` in content. |

---

## 2. Remove for each assistant

For each assistant, run **Remove workflow** (or remove all) and confirm only extension-added artifacts are removed (manifest-based).

| Step | Action | Verify |
|------|--------|--------|
| 2.1 | Remove Cursor | Only `.cursor/` and `.cursor-plugin/` that were applied are removed. |
| 2.2 | Remove Claude | Only `.claude/` and `CLAUDE.md` that were applied are removed. |
| 2.3 | Remove Copilot | Only `.github/` and `AGENTS.md` artifacts added by the extension are removed. |
| 2.4 | Remove Codex | Only `~/.codex/skills/` and `AGENTS.md` (workspace/user) added by the extension are removed. |

---

## 3. Package and install VSIX

| Step | Action | Verify |
|------|--------|--------|
| 3.1 | From repo root: `npm run compile && npx vsce package` | Build succeeds; `.vsix` is produced. If you see `Expected concurrency to be an integer`, it is a vsce/secretlint bug — the file list still showed `workflow/` (171 files) included before the error. |
| 3.2 | Install the VSIX in a clean profile (or clean test workspace) | Extension installs and activates. |
| 3.3 | Run all apply flows (Cursor, Claude, Copilot, Codex) from the VSIX install | Same as section 1; destinations match workflow trees. |
| 3.4 | Run remove for each assistant | Same as section 2; manifest-based remove only. |

---

## Sign-off

- [x] **Script:** Apply Cursor, Claude, Copilot to temp workspace — destinations match `workflow/<assistant>/` (and plugin dir for Cursor). Remove Cursor/Claude/Copilot — manifest-based.
- [x] **Script:** Codex source tree `workflow/codex/skills/` and `workflow/codex/AGENTS.md` exist.
- [x] **Compile:** `npm run compile` succeeds.
- [ ] **vsce package:** Run `npx vsce package` manually; may fail with vsce/secretlint concurrency error (see 3.1). If it succeeds, `.vsix` is produced.
- [ ] **IDE:** Install VSIX in a clean profile; run Apply/Remove for Cursor, Claude, Copilot, Codex from the command palette and confirm same outcomes.
- [ ] All remove steps in IDE: only extension-added artifacts removed.

*When complete, this checklist confirms AC-6 and AC-7 (apply/remove from packaged install).*

---

## Future unit / integration tests

When a test suite is added:

- **getWorkflowSourceRoot** (`src/workflowPaths.ts`): Add a small test that it returns `path.join(extensionPath, "workflow", assistant)` for each of `cursor`, `claude`, `copilot`, `codex`, and throws for an invalid assistant.
- **Adapter tests**: Mock or assert source paths as `workflow/<assistant>/` (via `getWorkflowSourceRoot(extensionPath, assistant)`), not `extensionPath/.cursor/`.
