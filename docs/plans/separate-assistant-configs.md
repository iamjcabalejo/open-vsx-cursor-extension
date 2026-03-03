# Plan: Separate Assistant Configs (Multi-Assistant Workflow Overhaul)

## Task analysis / metadata

| Field | Value |
|-------|--------|
| **Type** | Refactor / Infrastructure |
| **Complexity** | Large — New directory layout, four assistant-specific trees, adapter logic change, one-time migration of existing content, packaging and docs updates. |
| **Estimated effort** | 3–5 days |
| **Priority** | High (architectural change affecting all adapters and packaging) |

---

## Scope / metadata

- **In scope**
  - Introduce four assistant-specific source trees: **Cursor**, **Claude**, **GitHub Copilot**, **Codex** (each with tailored folder structure: agents, skills, rules, hooks, and any assistant-specific files).
  - Change adapters to read from their assistant’s tree and copy/sync to the workspace (or user dir) with **no** conversion from a single `.cursor` source.
  - One-time migration: populate the four trees from current `.cursor/` and `.cursor-plugin/` content (with format/layout tailored per assistant where docs differ).
  - Update packaging (e.g. `.vscodeignore`), plugin manifest, and docs (README, DEV-GUIDE) to describe the new layout and apply behavior.
- **Out of scope**
  - Changing the **user-facing** apply/remove behavior (e.g. where Cursor/Claude/Copilot/Codex files are written); only the **source** of that content moves from single `.cursor` to per-assistant folders.
  - Adding new AI assistants or new instruction types beyond what each platform already supports.
- **Security** | Not critical for this refactor.
- **Performance** | Not critical; apply remains file copy/sync.

---

## Feature overview

- **Problem**  
  Today the extension has a single source of truth (`.cursor/` and `.cursor-plugin/`) and converts it when applying to Claude, Copilot, and Codex. Path rewrites (`.cursor/` → `.claude/`, `.github/`, `AGENTS.md`), format changes (`.mdc` → `.md`), and inlining (e.g. skills into Copilot agents) are done at apply time. This makes it hard to tailor content per platform and forces one format (Cursor’s) to fit all.

- **Audience**  
  Extension maintainers and contributors who edit rules, agents, skills, and hooks; end users continue to use “Apply workflow for…” as today.

- **Key functionality**
  - Four dedicated source trees: **cursor**, **claude**, **copilot**, **codex** (names/locations TBD; see Technical design).
  - Each tree has the structure expected by that assistant’s docs (agents, skills, rules, hooks; plus CLAUDE.md, .github layout, AGENTS.md, etc. as needed).
  - Adapters **only** copy/sync from their tree into the workspace (or user directory); no cross-assistant conversion.
  - One-time migration from current `.cursor/` (and `.cursor-plugin/` for Cursor) into the four trees, with content tailored per platform.
  - Extension package ships the four trees; apply commands read from them and write the same targets as today.

---

## Acceptance criteria

- **AC-1** — Four assistant-specific source directories exist in the repo (e.g. `workflow/cursor/`, `workflow/claude/`, `workflow/copilot/`, `workflow/codex/` or top-level `cursor/`, `claude/`, `copilot/`, `codex/`). Each contains only structure and content for that assistant (no shared “convert from .cursor” step).
- **AC-2** — **Cursor:** Source tree has rules, agents, skills, commands, hooks, and a way to ship the Cursor plugin manifest (e.g. `plugin.json` pointing at the copied `.cursor` paths). Apply copies this tree to workspace `.cursor/` and `.cursor-plugin/`; behavior matches current “Apply workflow for Cursor.”
- **AC-3** — **Claude:** Source tree has agents, rules, skills, hooks, and CLAUDE.md (or generator). Structure follows [Claude Code docs](https://code.claude.com/docs/en/skills) (e.g. `.claude/agents/`, `.claude/rules/`, `.claude/skills/`, `CLAUDE.md`). Apply writes to workspace `.claude/` and `CLAUDE.md` (or user `~/.claude/`) without reading Cursor paths or rewriting `.cursor/` → `.claude/`.
- **AC-4** — **Copilot:** Source tree has the layout that maps to workspace `.github/` and root `AGENTS.md`: e.g. `copilot-instructions.md`, `instructions/*.instructions.md`, `agents/*.agent.md`, `workflows/` (hooks), and any ISSUE_TEMPLATE content. Apply writes only from this tree (no build from `.cursor` rules/agents/skills). User-level prompts content, if still needed, is sourced from this tree.
- **AC-5** — **Codex:** Source tree has content for `AGENTS.md` (user and/or project) and skills (e.g. files synced to `~/.codex/skills/`). Structure follows [Codex customization](https://developers.openai.com/codex/guides/agents-md) and [Codex skills](https://developers.openai.com/codex/skills/). Apply syncs from this tree only (no reading from `.cursor/skills` or `.cursor/rules`).
- **AC-6** — All “Apply workflow for &lt;assistant&gt;” commands succeed when the extension is run from a packaged install (e.g. VSIX) and produce the same user-visible outcomes as today (same files in workspace/user dir).
- **AC-7** — “Remove workflow” for each assistant removes only the same artifacts as today (recorded in manifest); remove logic uses the same targets, not the new source trees.
- **AC-8** — Existing workflow content (compounding dev cycle, core standards, agents, skills, commands, hooks) is present in each assistant’s tree after migration, with formats and paths appropriate to that assistant (e.g. `.mdc` only where Cursor expects it; `.md` and path refs for Claude/Copilot/Codex).
- **AC-9** — README and DEV-GUIDE describe the new “separate configs per assistant” model and where to edit content for each assistant; `.vscodeignore` (or equivalent) does not exclude the four source trees from the package.

---

## Technical design

### Components / modules

- **Source trees (new)**  
  Four directories, e.g. under `workflow/` or at repo root:
  - `cursor/` — Mirrors current `.cursor/` layout: `rules/`, `agents/`, `skills/`, `commands/`, `hooks/`, `hooks.json`. Optionally `cursor/plugin/` (or keep `.cursor-plugin/`) with `plugin.json` pointing to `.cursor/` when copied.
  - `claude/` — `.claude`-style layout: `agents/`, `rules/`, `skills/`, `hooks/`; plus content or generator for `CLAUDE.md` (project/user). File formats: `.md`; no `.mdc`. Path references already use `.claude/` (no rewrite).
  - `copilot/` — Layout that maps 1:1 to workspace `.github/` and root: e.g. `copilot-instructions.md`, `instructions/`, `agents/` (`.agent.md`), `workflows/` (hooks), `ISSUE_TEMPLATE/` if any. No inlining from another tree at apply time.
  - `codex/` — Content for workspace `AGENTS.md` and user `~/.codex/AGENTS.md`; and a `skills/` tree to sync to `~/.codex/skills/`. Codex has no separate “rules” folder; rules live inside AGENTS.md content.

- **Adapters (changed)**  
  - `cursor.ts`: Copy from `extensionPath/cursor/` → workspace `.cursor/`; copy from `extensionPath/.cursor-plugin/` (or `cursor/plugin/`) → `.cursor-plugin/`. No reading from a shared `.cursor` used by other adapters.
  - `claude.ts`: Copy/sync from `extensionPath/claude/` to workspace `.claude/` and `CLAUDE.md` (or `~/.claude/`). Build `CLAUDE.md` from `claude/rules/` only if we keep a single generated file; otherwise ship a pre-built `CLAUDE.md` in the tree. No `rewriteCursorPathsToClaude` or reading from `.cursor/`.
  - `copilot.ts`: Write workspace `.github/` and `AGENTS.md` only from `extensionPath/copilot/`. User-level instructions, if any, come from files in `copilot/` (e.g. a single instructions file). No `buildInstructionsMd`/`buildAgentsMd` that read from `.cursor/rules` or `.cursor/agents`; no inlining from `.cursor/skills`.
  - `codex.ts`: Sync skills from `extensionPath/codex/skills/` to `~/.codex/skills/`; write `AGENTS.md` (user and workspace) from `extensionPath/codex/` (e.g. `codex/AGENTS.md` template or fragments). No reading from `.cursor/rules` or `.cursor/agents`; no `rewriteCursorPathsToCodex`.

- **Shared / removed**
  - `compoundingDevCycle.ts`: Currently reads `.cursor/rules/compounding-dev-cycle.mdc`. Either remove (each tree has its own cycle doc) or generalize to `getCompoundingDevCycleContent(extensionPath, assistant)` reading from that assistant’s tree (e.g. `codex/compounding-dev-cycle.md`). Prefer: remove; Codex/Copilot user-level content lives in their trees.
  - Path-rewrite helpers in each adapter: Remove once sources are assistant-specific (no `.cursor/` in content).

### Directory layout (recommended)

Use a single parent to avoid cluttering repo root and make packaging explicit:

```
<repo>/
  workflow/
    cursor/          # Cursor-only layout
      agents/
      skills/
      rules/
      commands/
      hooks/
      hooks.json
    cursor-plugin/   # or keep .cursor-plugin at root with paths .cursor/...
      plugin.json
    claude/
      agents/
      rules/
      skills/
      hooks/
      CLAUDE.md      # or build from rules at apply time
    copilot/
      copilot-instructions.md
      instructions/
      agents/
      workflows/
      (ISSUE_TEMPLATE/ if needed)
    codex/
      skills/       # synced to ~/.codex/skills
      AGENTS.md     # workspace; user-level variant or fragment in codex/user/
      (user/        # optional: ~/.codex/AGENTS.md content)
```

Alternative: top-level `cursor/`, `claude/`, `copilot/`, `codex/` (and keep `.cursor-plugin/` at root). Plan should pick one and stick to it.

### Data flow

- **Today:** `extensionPath/.cursor/` + `.cursor-plugin/` → adapters read → rewrite paths/formats → write to workspace/user.
- **After:** `extensionPath/workflow/<assistant>/` (or `extensionPath/<assistant>/`) → adapter for that assistant reads → copy/sync only → write to same workspace/user targets. No cross-assistant content.

### References

- `core-standards.mdc` — Content will live in each tree in the appropriate format (e.g. Cursor: `.mdc`; others: `.md`).
- `docs/improvements/04-codex-and-copilot-rules.md` — Documents Copilot (`.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, `.github/agents/`) and Codex (AGENTS.md chain, no separate rules folder).
- Claude Code: [Skills](https://code.claude.com/docs/en/skills), [Memory/CLAUDE.md](https://code.claude.com/docs/en/memory), [Settings](https://code.claude.com/docs/en/settings).
- Cursor: [Rules](https://cursor.com/docs/context/memories), [Agent Skills](https://cursor.com/docs/context/skills).
- Codex: [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Skills](https://developers.openai.com/codex/skills/).

---

## Backend tasks

(No separate backend service; “backend” here = adapter and packaging code.)

### Phase 1 — Setup

- [ ] Create `workflow/` (or chosen root) and subdirs: `workflow/cursor/`, `workflow/claude/`, `workflow/copilot/`, `workflow/codex/`.
- [ ] Decide and document: keep `.cursor-plugin/` at repo root vs under `workflow/cursor-plugin/`; ensure plugin.json paths point to `.cursor/` when copied to workspace.
- [ ] Add constants or config for source roots (e.g. `getWorkflowSourceRoot(extensionPath, assistant)` → `path.join(extensionPath, 'workflow', assistant)`).
- **File changes:** New dirs; optional `src/workflowPaths.ts` (or in adapters); update `.vscodeignore` so `workflow/**` is included in package (remove or avoid excluding it).

### Phase 2 — Migration (one-time)

- [ ] Copy `.cursor/agents/`, `rules/`, `skills/`, `commands/`, `hooks/`, `hooks.json` into `workflow/cursor/` (so Cursor apply can use `workflow/cursor/` as source).
- [ ] Create `workflow/claude/`: copy Cursor agents/rules/skills/hooks; convert `.mdc` → `.md`, rewrite any `.cursor/` refs to `.claude/` in content; add or build `CLAUDE.md` from rules.
- [ ] Create `workflow/copilot/`: build `copilot-instructions.md` and `instructions/compounding-dev-cycle.instructions.md` from current rules; build `agents/*.agent.md` with inlined skills from current agents + skills; copy hooks to `workflows/`; add `AGENTS.md` template; ISSUE_TEMPLATE if used.
- [ ] Create `workflow/codex/`: add `skills/` (copy from current `.cursor/skills/`, adjust paths in content to `~/.codex/skills/` or AGENTS.md); add workspace `AGENTS.md` content and user-level AGENTS.md content (compounding cycle + agent summaries).
- **File changes:** New files under `workflow/*`; no change to `src/` in this phase except path constants if added in Phase 1.

### Phase 3 — Adapters

- [ ] **cursor.ts:** Source = `path.join(extensionPath, 'workflow', 'cursor')` (and plugin from `extensionPath/.cursor-plugin' or `workflow/cursor-plugin`). Copy tree to workspace `.cursor/`; copy plugin to `.cursor-plugin/`. Remove any dependency on a shared `.cursor` used by other adapters.
- [ ] **claude.ts:** Source = `path.join(extensionPath, 'workflow', 'claude')`. Copy `claude/agents/`, `claude/rules/`, `claude/skills/`, `claude/hooks/` to target `.claude/`; write `CLAUDE.md` from `claude/CLAUDE.md` or from `claude/rules/` if we keep a generator. Remove `rewriteCursorPathsToClaude` and all reads from `.cursor/`.
- [ ] **copilot.ts:** Source = `path.join(extensionPath, 'workflow', 'copilot')`. Write `.github/copilot-instructions.md`, `.github/instructions/`, `.github/agents/`, `.github/workflows/`, root `AGENTS.md` from `copilot/` files. User-level prompts from a file in `copilot/`. Remove `buildInstructionsMd`, `buildAgentsMd`, `syncCustomAgentsToGitHub`, `getSkillContent` that read from `.cursor/`; replace with copy/sync from `copilot/`.
- [ ] **codex.ts:** Source = `path.join(extensionPath, 'workflow', 'codex')`. Sync `codex/skills/` to `~/.codex/skills/`; write workspace and user `AGENTS.md` from `codex/` (e.g. `codex/AGENTS.md`, `codex/user/AGENTS.md`). Remove `buildAgentsMd` and path rewrites that read from `.cursor/`.
- [ ] **compoundingDevCycle.ts:** Remove or refactor. If any code still needs “compounding cycle” text (e.g. for a user-level snippet), read from `workflow/codex/` or `workflow/copilot/` instead of `.cursor/rules/`.
- **File changes:** `src/adapters/cursor.ts`, `claude.ts`, `copilot.ts`, `codex.ts`; `src/compoundingDevCycle.ts`; `src/installCodexSkills.ts` (point to `workflow/codex/skills` when syncing from extension).

### Phase 4 — Packaging and manifest

- [ ] Ensure `workflow/**` (or `cursor/**`, `claude/**`, etc.) is **not** in `.vscodeignore` so the package contains the four trees.
- [ ] If `.cursor/` and `.cursor-plugin/` are removed from repo and replaced by `workflow/cursor/` and `workflow/cursor-plugin/`, update any references (e.g. in docs or scripts). If we keep `.cursor-plugin/` at root, document that Cursor content lives in `workflow/cursor/` and only the manifest stays at root.
- [ ] Workflow manifest (`workflowManifest.ts`): no structural change; it records what was applied where. Adapters still call `recordWorkspaceApplied` / `recordUserApplied` and clear on remove.
- **File changes:** `.vscodeignore`; `package.json` if scripts reference old paths; `workflowManifest.ts` only if we need to record a new source path (optional).

### Dependencies / env

- No new packages or env vars. Existing `fs`, `path`, `os` usage in adapters.

---

## Frontend tasks

- No UI changes. Apply/Remove are still triggered by existing commands (QuickPick, etc.). Optional: show in UI which source tree is used (e.g. “Applying from workflow/claude”) — **out of scope** unless explicitly requested.

---

## Integration & testing

### E2E / manual

- [ ] **Apply Cursor** — From packaged extension, apply to a clean workspace; verify `.cursor/` and `.cursor-plugin/` match content of `workflow/cursor/` and plugin dir.
- [ ] **Apply Claude** — Project and user; verify `.claude/` and `CLAUDE.md` match `workflow/claude/`; no `.cursor/` paths in generated files.
- [ ] **Apply Copilot** — Verify `.github/copilot-instructions.md`, `.github/instructions/`, `.github/agents/*.agent.md`, `.github/workflows/`, `AGENTS.md` match or derive from `workflow/copilot/` only.
- [ ] **Apply Codex** — Verify `~/.codex/skills/` and workspace/user `AGENTS.md` come from `workflow/codex/`; no `.cursor/` in content.
- [ ] **Remove** — For each assistant, remove and confirm only extension-added artifacts are removed (manifest-based).
- [ ] **Package** — `npm run compile && vsce package`; install VSIX in clean profile; run all apply/remove flows above.

### Unit / integration

- [ ] Any unit tests that mock `extensionPath/.cursor/` should be updated to mock `workflow/<assistant>/` and assert adapters read from the new paths.
- [ ] If we add `getWorkflowSourceRoot()` or similar, add a small test that it returns the expected path for each assistant.

---

## File changes

| Path | Action |
|------|--------|
| `workflow/cursor/` | create (agents, skills, rules, commands, hooks, hooks.json) |
| `workflow/cursor-plugin/` or `.cursor-plugin/` | keep or move; plugin.json paths stay .cursor/ when copied |
| `workflow/claude/` | create (agents, rules, skills, hooks, CLAUDE.md) |
| `workflow/copilot/` | create (copilot-instructions.md, instructions/, agents/, workflows/, AGENTS.md) |
| `workflow/codex/` | create (skills/, AGENTS.md, optional user/) |
| `src/adapters/cursor.ts` | modify (source = workflow/cursor) |
| `src/adapters/claude.ts` | modify (source = workflow/claude; remove .cursor reads and rewrites) |
| `src/adapters/copilot.ts` | modify (source = workflow/copilot; remove .cursor reads and inlining) |
| `src/adapters/codex.ts` | modify (source = workflow/codex; remove .cursor reads) |
| `src/compoundingDevCycle.ts` | remove or refactor to read from workflow/codex or workflow/copilot |
| `src/installCodexSkills.ts` | modify (extension source = workflow/codex/skills when applying from extension) |
| `.vscodeignore` | modify (include workflow/** or equivalent) |
| `README.md`, `DEV-GUIDE.md` | modify (describe separate configs, where to edit per assistant) |
| `.cursor/`, `.cursor-plugin/` | optional: remove from repo after migration if fully replaced by workflow/cursor and workflow/cursor-plugin |

---

## Dependencies / env

- **Packages:** None new.
- **Env vars:** None.
- **Config:** `.vscodeignore` must not exclude the chosen workflow source root(s). `package.json` scripts unchanged unless we add a “migrate” or “sync-from-cursor” script for one-time use.

---

## Risks / potential issues

- **Content drift** — Four trees can diverge (e.g. compounding cycle updated in Cursor but not in Codex). Mitigation: document that each tree is authoritative for that assistant; consider a short “canonical sources” table in DEV-GUIDE listing which file in which tree holds equivalent content.
- **Migration completeness** — Some rules or skills might be missed when splitting. Mitigation: checklist in Phase 2 comparing current `.cursor` contents to each tree; manual review of generated Copilot/Codex content.
- **Plugin manifest** — If we move Cursor content to `workflow/cursor/`, plugin.json still references `.cursor/` when installed; that’s correct. If we ship `workflow/cursor-plugin/`, ensure it’s copied to `.cursor-plugin/` and paths inside stay `.cursor/`.
- **Codex user-level AGENTS.md** — Today we build it from compounding dev cycle content. After refactor, that content lives in `workflow/codex/`; ensure user-level apply still writes a valid `~/.codex/AGENTS.md` from that tree.
- **Breaking existing users** — Users who cloned the repo and run from source expect `.cursor/` to exist. Mitigation: either keep `.cursor/` as a copy of `workflow/cursor/` via a post-clone script, or document that “run from source” requires running a one-time “prepare workflow” step that copies `workflow/cursor/` → `.cursor/` for local Cursor use. Prefer: after migration, make `workflow/cursor/` the only source and have Cursor apply copy it to workspace; for **this repo**, developers can “Apply workflow for Cursor” to themselves or keep a symlink/copy for local editing.

---

## Next steps

1. Run **project-manager** with this plan to execute Code → Review/Test (e.g. `project-manager docs/plans/separate-assistant-configs.md`).
2. Before implementation: confirm with stakeholders the chosen root for the four trees (`workflow/` vs top-level `cursor/`, `claude/`, `copilot/`, `codex/`) and whether to remove `.cursor/` from the repo after migration.

---

*This plan was produced by the **feature-plan** command in Plan mode. No implementation was performed.*
