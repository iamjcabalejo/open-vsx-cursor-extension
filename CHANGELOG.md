# Changelog

## [4.0.1] - 2025-03-01

### Added

- README: **Loading the tools** section with steps and sample prompts for Codex, Claude Code, Copilot, and Cursor (how to load and use rules/skills/agents; list of Codex skill names).

### Changed

- Claude adapter: hook command now uses `$CLAUDE_PROJECT_DIR/.claude/hooks/…` for reliable resolution; `.claude/settings.json` includes `$schema` for Claude Code settings.
- DEV-GUIDE: clarified that generated `.claude` layout follows Claude Code's official project pattern.

## [4.0.0] - 2025-03-01

### Added

- **DEV-GUIDE.md** — Developer guide: why we don't add `.claude` to the repo, packaging (`.vscodeignore`), how adapters work, testing and releasing.
- Command: **Payoy's Setup: Open Developer Guide** — opens DEV-GUIDE.md.

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
- Command: **Payoy's Cursor Setup: Open Guide** — opens the main README
- Command: **Payoy's Cursor Setup: Open Publishing Guide** — opens PUBLISHING.md

This extension surfaces the Cursor plugin documentation inside VS Code and Cursor. For the full plugin (commands, agents, skills, rules, hooks), install from GitHub: `cursor plugins install iamjcabalejo/payoys-cursor-sub-agents`.
