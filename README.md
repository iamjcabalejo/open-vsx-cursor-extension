# Plan-Code-Review Workflow

**One workflow. Four AI assistants. Production-ready code—without the guesswork.**

Apply the **compounding dev cycle** (Plan → Code → Review/Test) to **Cursor**, **Claude Code**, **GitHub Copilot**, or **Codex**. Get a single source of truth, automatic code review, and a repeatable path from idea to shipped feature.

---

## The compounding dev cycle (why this workflow)

AI can write code fast—but without a clear plan and review loop, you get scope creep, untested assumptions, and “what did it actually build?” moments. The **compounding dev cycle** fixes that.

| Phase | What happens | What you get |
|-------|----------------|--------------|
| **Plan** | One written plan: scope, acceptance criteria, technical approach | No guesswork. Code implements to the plan; review verifies against the same criteria. |
| **Code** | Implementation + tests + implementation notes | Traceability. Every change links back to the plan (e.g. “implements AC-1”). |
| **Review/Test** | Automatic code review (backend + frontend reviewers) | Quality gates. Critical issues → rework plan → Code → Review again until **production ready**. |
| **Plan (next)** | Rework or new scope becomes the next cycle | Clear handoffs. Written artifacts for every phase so you and the AI always have the right context. |

**In practice:** Run `/feature-plan` once → get a plan file. Run `/project-manager` with that plan → implementation runs, then **review runs automatically**. If reviewers find critical issues, the workflow re-plans, fixes, and re-reviews until the code is ready. One plan, one command, production ready.

---

## Why install?

- **No more “what did the AI build?”** — One plan doc is the contract. Code and review both use it.
- **Automatic code review** — Backend and frontend reviewers run after implementation; critical issues trigger a rework loop until gates pass.
- **Works with your stack** — Same cycle for Cursor (slash commands), Claude Code, Copilot, or Codex; the extension installs the right files for your assistant.
- **17 specialized agents + 14 skills** — Planning, architecture, API design, security, accessibility, E2E—all wired into the cycle.
- **Takes minutes** — Install the extension, run one “Apply workflow” command, and you’re set.

---

## Install the extension

- **VS Code:** [VS Code Marketplace](https://marketplace.visualstudio.com/) or [Open VSX](https://open-vsx.org/) — search for **Plan-Code-Review Workflow**.
- **Cursor IDE:** The Cursor plugin is not yet available in Cursor’s plugin marketplace (approval pending). **Use this instead:** install the extension in **VS Code**, open your project in VS Code, run **Plan-Code-Review: Apply workflow for Cursor**, then open the same project in Cursor—the workflow files (`.cursor/`, `.cursor-plugin/`) are in your repo and Cursor will use them. Full plugin install from Cursor’s marketplace will be available once approved.

## Apply the workflow to your project

1. Open your **project root** in **VS Code** (or in Cursor if you already have the workflow applied).
2. Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → run one of:
   - **Plan-Code-Review: Apply workflow for… (choose AI)** — pick Cursor, Claude Code, Copilot, or Codex
   - Or a specific command: **Plan-Code-Review: Apply workflow for Cursor** / **Claude Code** / **GitHub Copilot** / **Codex**

For **Claude Code**, you’ll be asked whether to install in the **project root** (`.claude` in this workspace) or in your **user directory** (`~/.claude/`, so the workflow applies to all projects).

**Cursor users:** Install the extension in VS Code, open your project there, run **Plan-Code-Review: Apply workflow for Cursor**, then switch to Cursor and open the same project—you get full slash commands and agents. No Cursor plugin install needed until the plugin is approved.

The extension writes the right files into your workspace. Your AI assistant uses them automatically.

### Remove the workflow

To remove **only** what this extension added (your existing commands, skills, rules, and hooks from other sources stay untouched):

- Command Palette → **Plan-Code-Review: Remove workflow from all AI assistants**

The extension keeps a manifest of what it applied (workspace and user). Remove uses that list so only extension-added items are deleted. To see exactly what’s recorded before removing:

- Command Palette → **Plan-Code-Review: Show applied workflow log**

| Assistant     | What gets created |
|---------------|-------------------|
| **Cursor**    | `.cursor/`, `.cursor-plugin/` — full slash commands, agents, rules, hooks |
| **Claude Code** | `.claude/agents/`, `.claude/rules/`, `.claude/skills/`, `CLAUDE.md`, `.claude/hooks/` — in project root **or** in `~/.claude/` (you choose when applying) |
| **GitHub Copilot** | User-level: **rules, agents, skills** in **prompts** folder (all workspaces). Workspace: **`.github/`** — **`agents/`** (custom agents as `<name>.agent.md`, skills inlined), **`copilot-instructions.md`** (rules), **`workflows/`** (hooks), **`ISSUE_TEMPLATE/`** (structured prompts); **`AGENTS.md`** at repo root (compounding dev cycle). |
| **Codex**     | User-level: **~/.codex/AGENTS.md** (compounding dev cycle) + **~/.codex/skills/** (synced). Workspace: `AGENTS.md` |

**Cursor:** Use `/feature-plan`, `/project-manager`, `/api-new`, etc. **Others:** Reference the generated files in chat (e.g. “Follow CLAUDE.md”, “Use the code-review skill”).

## What’s inside

**Commands (Cursor):** `/feature-plan`, `/project-manager`, `/api-new`, `/api-test`, `/api-protect`, `/component-new`, `/page-new`, `/code-review`, `/docs-generate`, `/commit-best`, and more.

**Agents (17):** backend-architect, frontend-architect, backend-reviewer, frontend-reviewer, e2e-runner, requirements-analyst, tech-stack-researcher, security-engineer, and others—all aligned to the compounding cycle.

**Skills (14):** code-review, api-design-patterns, api-testing, e2e-playwright, accessibility-checklist, postgresql, and more.

**Rules (6):** core-standards, **compounding-dev-cycle**, typescript, react, api-routes, e2e-tests.

## Best for

Next.js, TypeScript, React, Supabase, and full-stack projects. Works with any stack.

## Requirements

**Cursor**, **Claude Code**, **GitHub Copilot**, or **Codex** (at least one). For Cursor, apply the workflow via VS Code first; then you get the full slash-command experience in Cursor.

## Customization

Edit `.cursor/commands/`, `.cursor/agents/`, `.cursor/skills/`, `.cursor/rules/`, and `.cursor/hooks.json` after applying the workflow.

## More info

- **Developer guide:** Command Palette → **Plan-Code-Review: Open Developer Guide**
- **Publishing:** Command Palette → **Plan-Code-Review: Open Publishing Guide**

## License & author

MIT — use freely.
