# Changelog

## [4.1.0] - 2026-03-01

### Added

- **Cursor**: When applying the workflow for Cursor, you can choose to install at **project level** (`.cursor` and `.cursor-plugin` in this workspace) or **user level** (`~/.cursor` and `~/.cursor-plugin`). User level applies the workflow to all projects.

## [4.0.5] - 2026-03-01

### Added

- **Claude Code**: When applying the workflow for Claude Code, you are now asked whether to install in the **project root** (`.claude` in this workspace) or in your **user directory** (`~/.claude/`). User directory applies the workflow to all projects without a per-project `.claude` folder.
- **Claude Code**: Apply workflow now copies **`.claude/rules/`** (including the compounding dev cycle, core standards, api-routes, etc.) and **`.claude/skills/`** (all skills with SKILL.md and supporting files) from the extension, so Claude Code loads them as modular rules and skills in addition to the combined CLAUDE.md.
- **Codex**: Apply workflow now writes **~/.codex/AGENTS.md** at **user level** with the **compounding dev cycle** so it applies in all projects (Codex merges global + project AGENTS.md). Workspace still gets project-level AGENTS.md with full rules and agent summaries.
- **GitHub Copilot**: Apply workflow now installs **rules, agents, and skills** at **user level** in the VS Code/Cursor **prompts** folder as `plan-code-review-workflow.instructions.md` (applyTo: `**`), so the full workflow applies in all workspaces. Skills are listed with name and description from `.cursor/skills`. Workspace still gets `.github/copilot-instructions.md` and `AGENTS.md`.

## [4.0.4] - 2025-03-01

### Changed

- **Codex workflow**: Apply workflow syncs skills directly to `~/.codex/skills` (no `.agents/skills`). Existing skills are overwritten on install/apply.
- **Versions**: All project version numbers aligned to 4.0.4.

## [4.0.3] - 2025-03-01

### Changed

- **Display name**: "Plan-Code-Review Workflow" (was the previous display name).
- **Description**: Updated to emphasize Plan → Code → Review cycle and multi-AI support.
- **Command titles**: All workflow commands now use the "Plan-Code-Review:" prefix (e.g. "Plan-Code-Review: Apply workflow for Codex").
- **Versions**: All project version numbers aligned to 4.0.3 (package.json, .cursor-plugin/plugin.json, .cursor-plugin/marketplace.json, package-lock.json).

## [4.0.2] - 2025-03-01

### Changed

- README: shortened and reorganized; emphasis on compounding dev cycle and "Why install?" section.
- README: Cursor IDE install clarified—plugin pending approval; use VS Code + Apply workflow for Cursor, then open project in Cursor.

## [4.0.1] - 2025-03-01

### Added

- README: **Loading the tools** section with steps and sample prompts for Codex, Claude Code, Copilot, and Cursor (how to load and use rules/skills/agents; list of Codex skill names).

### Changed

- Claude adapter: hook command now uses `$CLAUDE_PROJECT_DIR/.claude/hooks/…` for reliable resolution; `.claude/settings.json` includes `$schema` for Claude Code settings.
- DEV-GUIDE: clarified that generated `.claude` layout follows Claude Code's official project pattern.

## [4.0.0] - 2025-03-01

### Added

- **DEV-GUIDE.md** — Developer guide: why we don't add `.claude` to the repo, packaging (`.vscodeignore`), how adapters work, testing and releasing.
- Command: **Plan-Code-Review: Open Developer Guide** — opens DEV-GUIDE.md.

### Changed

- Version bump to 4.0.0 (multi-AI workflow, adapters, dev guide).

## [3.2.0] - 2025-03-01

### Added

- Apply workflow for any AI assistant: Cursor, Claude Code, GitHub Copilot, Codex. Commands: **Apply workflow for current AI**, **Apply workflow for… (choose AI)**, and per-assistant commands (Cursor, Claude Code, Copilot, Codex). Each writes the right config (e.g. `.cursor/`, `.claude/`, `.github/copilot-instructions.md`, `.agents/skills`, `AGENTS.md`).

### Changed

- Extension description updated to mention use with Cursor, Claude Code, GitHub Copilot, and Codex.

## [3.1.0] - 2025-02-28

### Added

- Initial release as a VS Code / Open VSX extension
- Command: **Plan-Code-Review: Open Guide** — opens the main README
- Command: **Plan-Code-Review: Open Publishing Guide** — opens PUBLISHING.md

This extension surfaces the Cursor plugin documentation inside VS Code and Cursor. For the full plugin (commands, agents, skills, rules, hooks), install from GitHub: `cursor plugins install iamjcabalejo/plan-code-review-workflow`.
