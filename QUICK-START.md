# Quick Start: Publish Your Plugin in 5 Minutes

## TL;DR

This plugin provides **15 slash commands**, **17 AI agents**, **14 skills**, **6 rules**, and **hooks**. At its core is a **compounding development cycle**: Plan → Code → Review/Test → Plan. Run `/feature-plan` to create a plan file, then `/project-manager <plan-path>` to implement, auto-run code review, and loop until production ready. Hooks inject cycle context at session start and keep code formatted and audited.

## What You Have

✅ **15 Slash Commands**
- Development: `/new-task`, `/code-explain`, `/code-optimize`, `/code-cleanup`, `/feature-plan`, `/project-manager`, `/lint`, `/docs-generate`, `/agents-md-generate`
- API: `/api-new`, `/api-test`, `/api-protect`
- UI: `/component-new`, `/page-new`
- Supabase: `/types-gen`, `/edge-function-new`
- Git: `/commit-best`

✅ **17 AI Agents**
- Architecture & Planning: tech-stack-researcher, system-architect, architecture-strategist, backend-architect, database-expert, frontend-architect, requirements-analyst
- Code Quality & Testing: e2e-runner, refactoring-expert, pattern-recognition-specialist, performance-engineer, security-engineer
- Review (cycle): backend-reviewer, frontend-reviewer
- Documentation & Research: technical-writer, learning-guide, deep-research-agent

✅ **14 Skills** (in `.cursor/skills/`) — e.g. api-design-patterns, api-testing, feature-planning, code-review, e2e-playwright, security-audit, accessibility-checklist

✅ **6 Rules** (in `.cursor/rules/`) — core-standards, compounding-dev-cycle, typescript, react, api-routes, e2e-tests

✅ **Hooks** (`.cursor/hooks.json`) — session-init (cycle reminder), format (Prettier after edit), audit (traceability log). Run `chmod +x .cursor/hooks/*.sh` after installation.

## Next Steps

1. **Read PUBLISHING.md** — Full step-by-step guide (repo creation, push, versioning).
2. **Create GitHub Repo** — https://github.com/new (public, no initial README if you already have one).
3. **Push Code** — Add remote, push `main`. Ensure `.cursor-plugin/plugin.json` exists at repo root.
4. **Share** — Post on social media, submit to marketplaces. Use the description in PUBLISHING.md for consistency.

## Need Help?

- **PUBLISHING.md** — Detailed publishing and maintenance instructions.
- **README.md** — Full plugin documentation (cycle, commands, agents, skills, rules, hooks).
- Cursor Docs: https://docs.cursor.com

---

**You're ready to publish!** 🚀
