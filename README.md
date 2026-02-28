# Brader Payoy's Cursor Setup

**Payoy's Cursor Sub-Agents** is available as a **VS Code extension** (VS Code Marketplace & Open VSX) and as a **Cursor plugin** (install from GitHub). This README describes the full setup; the extension surfaces the guide and publishing docs inside VS Code and Cursor.

**Use with any AI assistant:** The extension can apply this workflow (rules, agents, skills, commands, hooks) to **Cursor**, **Claude Code**, **GitHub Copilot**, or **Codex**. Open the Command Palette and run **Payoy's Setup: Apply workflow for current AI** (auto-detects) or **Payoy's Setup: Apply workflow for… (choose AI)** to pick one. Each assistant gets the right config (e.g. `.cursor/` for Cursor, `.claude/agents` + `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` and `AGENTS.md` for Copilot, `.agents/skills` + `AGENTS.md` for Codex).

### How it works with your AI assistant

The same workflow (Plan → Code → Review/Test, agents, skills, rules) is **adapted automatically** to the assistant you use. Below is what happens when you apply the workflow for each one and how you use it there.

---

#### If you use **Claude Code**

When you run **Payoy's Setup: Apply workflow for Claude Code**, the extension writes into your **workspace root**:

- **`.claude/agents/`** — A copy of all 17 agent definitions (e.g. backend-architect, frontend-reviewer). Claude Code loads subagents from this folder, so Claude can adopt those roles when you delegate or when the context fits.
- **`CLAUDE.md`** — A single file that contains your **rules** (compounding dev cycle, core standards, TypeScript, React, API, E2E). Claude Code reads this as project instructions, so every chat follows Plan → Code → Review/Test and your coding standards.
- **`.claude/hooks/`** — Scripts (e.g. session-init, format, audit) copied from the workflow. Optional **`.claude/settings.json`** is created with a SessionStart hook so Claude can run `session-init.sh` at session start and remind itself of the cycle.

**How you use it:** Open Claude Code in that workspace. Your **rules** are in `CLAUDE.md` (and optionally in `.claude/settings.json`), so they apply to all conversations. Your **agents** live in `.claude/agents/`; you can reference them in prompts (e.g. “act as the backend-architect from the agents”) or rely on Claude’s subagent system if it uses that folder. **Skills** (e.g. code-review, api-design-patterns) are described inside the rules and agent files, so you can say “follow the code-review checklist” or “apply the API design patterns from the project rules.” **Commands** like feature-plan and project-manager are not slash commands in Claude; use them by pasting or summarizing the command text from `.cursor/commands/` into the chat (e.g. “Do a feature plan for …” or “Run the project-manager workflow from this plan”). **Hooks** run automatically if you keep the generated `.claude/settings.json` and make the scripts in `.claude/hooks/` executable (`chmod +x .claude/hooks/*.sh`).

---

#### If you use **GitHub Copilot**

When you run **Payoy's Setup: Apply workflow for GitHub Copilot**, the extension writes:

- **`.github/copilot-instructions.md`** — Project-wide instructions for Copilot: your **rules** (compounding dev cycle, core standards, TypeScript, React, API, E2E) plus a short list of **agent roles** (backend-architect, frontend-reviewer, etc.) and when to use them. Copilot uses this file to steer suggestions and chat.
- **`AGENTS.md`** (at repo root) — The same content as above. Copilot (and some tools) also read `AGENTS.md` for repo-level guidance, so both files keep behavior consistent.

**How you use it:** Copilot will use the rules and agent list from `.github/copilot-instructions.md` and `AGENTS.md` as **always-on context**. You don’t run slash commands; instead, ask in natural language, e.g. “Plan a feature for …”, “Implement this like the backend-architect would,” or “Review this against the compounding dev cycle.” The **skills** (code-review, api-design-patterns, accessibility-checklist, etc.) are embedded in the rules and agent descriptions, so asking for “a code review following the project checklist” or “API design per our standards” aligns Copilot with the workflow. You can commit these files so the whole team gets the same guidance.

---

#### If you use **Codex**

When you run **Payoy's Setup: Apply workflow for Codex**, the extension writes:

- **`.agents/skills/`** — A copy of your **skills** from the workflow (e.g. api-design-patterns, code-review, e2e-playwright, postgresql). Codex discovers skills in this folder and can use them for focused tasks (e.g. “use the postgresql skill” or “apply the code-review skill”).
- **`AGENTS.md`** (at repo root) — Your **rules** (compounding dev cycle, core standards, TypeScript, React, API, E2E) plus a short list of **agent roles** and when to use them. Codex reads `AGENTS.md` for project guidance, so it follows the same cycle and standards.

**How you use it:** Codex uses **rules** from `AGENTS.md` and **skills** from `.agents/skills/` automatically when relevant. You can say “follow the compounding dev cycle” or “act as backend-architect for this API.” **Skills** are referenced by name (e.g. “use the api-testing skill” or “apply the accessibility checklist”). **Agents** are described in `AGENTS.md`; invoke them by role in your prompts. **Commands** (feature-plan, project-manager) are not native slash commands in Codex; describe the intent (e.g. “Create a feature plan for …” or “Implement from this plan and then review”) so Codex follows the same flow.

---

#### If you use **Cursor**

When you run **Payoy's Setup: Apply workflow for Cursor**, the extension copies the full workflow into your workspace:

- **`.cursor/`** — Rules, agents, skills, commands, and hooks.
- **`.cursor-plugin/`** — Plugin manifest so Cursor registers everything.

**How you use it:** You get the **full native experience**: slash commands (e.g. `/feature-plan`, `/project-manager`, `/api-new`), automatic agent selection, rules applied by scope, and hooks (session-init, format, audit). Skills are used by agents automatically. No extra steps—Cursor reads `.cursor/` and `.cursor-plugin/` directly. For the fullest setup, you can also install the Cursor plugin from GitHub (`cursor plugins install iamjcabalejo/payoys-cursor-sub-agents`) so commands and agents are registered from the plugin system.

---

**Summary:** One workflow, four ways to use it. Apply the workflow for your assistant once; then use **rules** via the generated project file (CLAUDE.md, AGENTS.md, or .cursor/rules), **agents** via the generated agents folder or instructions, **skills** via the skills folder (Codex) or by reference in rules/agents (Claude, Copilot), and **commands** either as native slash commands (Cursor) or by describing the same steps in chat (Claude, Copilot, Codex).

This plugin provides **15 slash commands**, **17 specialized AI agents**, **14 project skills**, **6 rules**, and **hooks** for trigger-based automation. At its core is a **compounding development cycle** that turns feature ideas into production-ready code with clear handoffs, automated code review, and a loop until quality gates pass.

## Why the compounding development cycle?

This custom Cursor workflow is built around **Plan → Code → Review/Test → Plan** because that cycle gives you:

- **No guesswork** — Every phase has a single source of truth (the plan). Code implements to the plan; reviewers verify against the same acceptance criteria. No “what did the AI actually build?” moments.
- **Traceability** — Work is linked back to the plan (e.g. “implements AC-1, AC-2”). You can see why each change exists and whether it’s done.
- **Quality gates** — Code reviewers (backend-reviewer, frontend-reviewer) run automatically after implementation. Critical issues become a rework plan; the system loops (Plan → Code → Review) until there are no critical issues and the code is **production ready**.
- **Clear handoffs** — Each phase produces written artifacts for the next: plan → implementation notes + tests → review summary + rework list. Agents (and you) always have the right context.
- **Separation of concerns** — Planning stays in `/feature-plan` (plan file only). Execution and review stay in `/project-manager` (Code → auto code review → loop). You choose when to run E2E. No single “do everything” prompt that forgets scope or skips review.

**In practice:** You run `/feature-plan` once to get a plan file, then `/project-manager` with that plan. The project-manager runs implementation (backend, frontend, E2E test authoring), then **automatically** runs code review. If reviewers find critical issues, it re-plans, fixes, and re-reviews until the code is ready for production. You get a repeatable, auditable path from idea to shipped feature.

### Workflow in one picture

```
You: /feature-plan "User profile API and edit page"
     → Plan written to docs/plans/user-profile.md (no agents run yet)

You: /project-manager docs/plans/user-profile.md
     → Code: backend-architect → frontend-architect → e2e-runner (implement)
     → Review: backend-reviewer → frontend-reviewer (auto, no E2E run)
     → If critical issues: rework plan → Code (fix) → Review again (loop)
     → When gates pass: "Production ready"

You: (optional) Run E2E when you want
```

One plan, one command to run the cycle, automatic review and loop until production ready—that’s the custom workflow.

## What's Inside

### 📋 Development Commands (8)

- `/new-task` - Analyze task complexity and create implementation plan (for full cycle use feature-plan → project-manager)
- `/code-explain` - Generate detailed explanations
- `/code-optimize` - Performance optimization
- `/code-cleanup` - Refactoring and cleanup
- `/feature-plan` - Produce feature plan only (writes `docs/plans/<feature>.md`)
- `/project-manager` - Run Code from plan, then auto-trigger code review (backend/frontend reviewers); loop on critical until production ready. E2E testing is user-triggered only.
- `/lint` - Linting and fixes
- `/docs-generate` - Documentation generation
- `/agents-md-generate` - AGENTS.md generation

### 🔌 API Commands (3)

- `/api-new` - Create new API endpoints
- `/api-test` - Test API endpoints
- `/api-protect` - Add protection & validation

### 🎨 UI Commands (2)

- `/component-new` - Create React components
- `/page-new` - Create Next.js pages

### 💾 Supabase Commands (2)

- `/types-gen` - Generate TypeScript types
- `/edge-function-new` - Create Edge Functions

### 🔀 Git Commands (1)

- `/commit-best` - Create a well-structured commit with conventional message and push

### 🤖 Specialized AI Agents (17)

**Architecture & Planning**
- **tech-stack-researcher** - Technology choice recommendations with trade-offs
- **system-architect** - Scalable system architecture design
- **architecture-strategist** - Analyze code changes for architectural compliance, boundaries, and pattern integrity; PR and structural refactor review
- **backend-architect** - Backend systems with data integrity & security
- **database-expert** - Query optimization and data access best practices (20+ years DBA experience)
- **frontend-architect** - Performant, accessible UI architecture
- **requirements-analyst** - Transform ideas into concrete specifications

**Code Quality & Testing**
- **e2e-runner** - End-to-end testing with Playwright
- **refactoring-expert** - Systematic refactoring and clean code
- **pattern-recognition-specialist** - Design patterns, anti-patterns, naming conventions, duplication; codebase consistency and pattern verification
- **performance-engineer** - Measurement-driven optimization
- **security-engineer** - Vulnerability identification and security standards

**Review (Plan → Code → Review/Test cycle)**
- **backend-reviewer** - Review backend code for correctness, security, API contract, and data integrity; produce concrete rework lists
- **frontend-reviewer** - Review frontend code for correctness, accessibility, performance, and standards; produce concrete rework lists

**Documentation & Research**
- **technical-writer** - Clear, comprehensive documentation
- **learning-guide** - Teaching programming concepts progressively
- **deep-research-agent** - Comprehensive research with adaptive strategies


## Best For

- Next.js developers
- TypeScript projects
- Supabase users
- React developers
- Full-stack engineers

## Usage Examples

### Creating a Commit

```bash
/commit-best
```

Runs the full workflow: if on `main`, creates a new branch; stages changes; generates a conventional commit message (feat, fix, docs, etc.); commits and pushes.

### Planning and implementing a feature

**Step 1 — Plan only (outputs a .md file):**

```bash
/feature-plan
# Then describe your feature idea (e.g. "User profile API and edit page")
```

This produces a plan and writes it to `docs/plans/<feature-slug>.md`. It does not run any implementation agents.

**Step 2 — Run implementation and code review:**

```bash
/project-manager docs/plans/user-profile.md
# Or: /project-manager user-profile
```

The project-manager reads the plan and: (1) **Code** — spawns backend-architect, frontend-architect, and e2e-runner (implementation) in order; (2) **Review** — automatically spawns backend-reviewer and frontend-reviewer (code review only; no E2E run); (3) if reviewers report **critical issues**, it plans rework, codes again, and reviews again until there are no critical issues and the code is **production ready**. **E2E testing** is not auto-triggered—run it when you want (e.g. run the test suite or ask e2e-runner to run/verify E2E for the feature).

### Creating an API

```bash
/api-new
# Cursor will scaffold a complete API route with types, validation, and error handling
```

### Research Tech Choices

Just ask Cursor questions like:
- "Should I use WebSockets or SSE?"
- "How should I structure this database?"
- "What's the best library for X?"

The tech-stack-researcher agent automatically activates and provides detailed, researched answers.

## Compounding development cycle (in detail)

The rule **`compounding-dev-cycle`** (`.cursor/rules/compounding-dev-cycle.mdc`) is always applied. It defines the four phases and the artifacts each phase must produce so the next one can run without guessing. Commands and agents are wired to this cycle so that:

1. **Plan** produces a written plan (scope, acceptance criteria, task blocks).
2. **Code** implements to that plan and produces implementation notes and tests.
3. **Review/Test** verifies against the plan and produces a rework list with severity (Critical / Suggestion / Nice to have).
4. **Plan (next)** turns rework into a small plan; then Code and Review/Test run again until gates pass and the code is **production ready**.

Why we follow this cycle: it removes ambiguity, keeps a single source of truth (the plan doc), and ensures quality through automatic code review and a loop on critical issues—so the workflow scales from small tasks to full features without losing traceability or control.

### How it works

| Phase | Goal | Handoff to next phase |
|-------|------|------------------------|
| **Plan** | Unambiguous scope, acceptance criteria (AC), technical approach, task list | Single plan doc (or in-chat artifact) so Code can implement without guessing |
| **Code** | Implement to the plan; no scope creep | Implementation + tests + **implementation notes** (done, deferred, assumptions) |
| **Review/Test** | Verify against AC and project rules; produce pass/fail and rework list | **Review summary** + **test status** + **rework list** (concrete, file/line + change + severity) |
| **Plan** (next) | Rework or new scope becomes a new cycle | Rework items → new acceptance criteria → Code → Review/Test again |

**Cross-phase:** All phases respect `core-standards.mdc` and domain rules (`api-routes.mdc`, etc.). Traceability: link code and review back to the plan (e.g. "implements AC-1, AC-2"). The plan doc is the single source of truth; when scope or criteria change, update the plan first.

### Commands in the cycle

- **Plan:** `/feature-plan` — Produces scope, acceptance criteria, technical approach, and task blocks (Backend / Frontend / Integration & Testing) and **writes the plan to `docs/plans/<feature-slug>.md`**. Plan only; no agents are spawned. You run **project-manager** next to execute the cycle.
- **Code + Review:** `/project-manager <plan-path>` — Runs the full cycle: **Code** (backend-architect, frontend-architect, e2e-runner for implementation), then **automatically** runs **code review** (backend-reviewer, frontend-reviewer only). If critical rework is found, it loops (rework plan → Code → Review) until **production ready**. E2E test execution is user-triggered only.
- **Supporting:** `/api-new`, `/api-protect`, `/code-cleanup`, `/api-test` — Focused commands that respect the same cycle (plan or context, implementation notes, review-ready output).

All commands and agents reference `compounding-dev-cycle.mdc` so every handoff is explicit and traceable.

### Agents in the cycle

| Phase | Agents | Role |
|-------|--------|------|
| **Plan** | requirements-analyst, tech-stack-researcher, system-architect, architecture-strategist (impact/boundaries), backend-architect, frontend-architect; pattern-recognition-specialist (consistency/patterns) | Discovery, tech choices, design; produce scope, AC, technical approach, task list. One agent may own the final plan. Architecture-strategist assesses impact and boundaries; pattern specialist supports consistency. |
| **Code** | backend-architect, frontend-architect, database-expert, e2e-runner (implementation), refactoring-expert | Implement to the plan; produce implementation + tests + implementation notes. |
| **Review/Test** | backend-reviewer, frontend-reviewer (auto-triggered by project-manager after Code); e2e-runner when user runs E2E; optionally security-engineer, performance-engineer, pattern-recognition-specialist, architecture-strategist | Consume plan + diff + implementation notes; produce review summary, rework list (Critical / Suggestion / Nice to have). Critical rework → Plan → Code → Review again until production ready. E2E testing is user-triggered only. |

Every agent file in `.cursor/agents/` includes a **Compounding dev cycle** section stating which phase(s) it participates in and what artifacts it produces or consumes. Supporting agents (learning-guide, technical-writer, deep-research-agent, pattern-recognition-specialist, architecture-strategist) reference the plan and standards when their work touches the cycle.

### Skills that support the cycle

- **feature-planning** — Task blocks for subagent hand-off (Plan → Code).
- **code-review** — Checklist for correctness, security, maintainability, style; used by backend-reviewer and frontend-reviewer.
- **api-design-patterns**, **api-testing** — API contract and test coverage; used in Code and Review/Test.
- **security-audit** — OWASP-aligned checks; used by security-engineer and backend-reviewer in Review/Test.
- **accessibility-checklist** — WCAG 2.1 AA; used by frontend-reviewer.
- **requirements-discovery** — PRDs, user stories, acceptance criteria; used in Plan.
- **performance-profiling** — Measure-first optimization; used when performance is in scope in Code/Review/Test.

Together, the rule, commands, agents, and skills keep the compounding cycle consistent: **written handoffs, no guesswork, and a single source of truth (the plan)** for the whole workflow—from idea to production-ready code.

## Philosophy

This setup emphasizes:

- **Compounding cycle** — Plan → Code → Review/Test → Plan with clear handoffs so agents (and you) always have a single source of truth and traceable artifacts. The cycle is why this workflow stays predictable and auditable at scale.
- **Type safety** — No `any` types; explicit types and project rules throughout.
- **Best practices** — Modern Next.js/React patterns, API and E2E conventions.
- **Productivity** — Less repetitive scaffolding; more time on design and review.
- **Research** — AI-powered tech decisions with evidence (tech-stack-researcher, requirements-analyst).

## Requirements

- **Cursor**, **Claude Code**, **GitHub Copilot**, or **Codex** (at least one installed). The extension detects which you have and applies the workflow accordingly. For the full slash-command and plugin experience, Cursor is recommended.
- Works with any project (optimized for Next.js + Supabase)

## Installation

**As a VS Code extension:** Install **Payoy's Cursor Sub-Agents** from the [VS Code Marketplace](https://marketplace.visualstudio.com/) or [Open VSX](https://open-vsx.org/) (Cursor’s extension source). You get the commands *Open Guide* and *Open Publishing Guide*; **Apply workflow for current AI** or **Apply workflow for… (choose AI)** to apply this workflow to Cursor, Claude Code, Copilot, or Codex; plus this README in the extension details.

**As a Cursor plugin (full setup):**

1. Push this repository to GitHub (see `PUBLISHING.md` if you need a refresher).
2. In Cursor, open the Command Palette and choose **Install Plugin from GitHub**.
3. Paste `iamjcabalejo/payoys-cursor-sub-agents` when prompted; Cursor will read `.cursor-plugin/plugin.json` and register all commands and agents automatically.
4. Alternatively, run the CLI command `cursor plugins install iamjcabalejo/payoys-cursor-sub-agents`.
5. After installation, tweak any command/agent files under `.cursor/commands/` or `.cursor/agents/` to suit your workflow.

### 🧩 Project Skills (13)

Skills in `.cursor/skills/` provide reusable workflows and checklists that agents apply automatically:

| Skill | Use Case |
|-------|----------|
| `api-design-patterns` | REST conventions, error handling |
| `api-testing` | API test structure and coverage |
| `accessibility-checklist` | WCAG 2.1 AA compliance |
| `e2e-playwright` | Playwright E2E patterns |
| `security-audit` | OWASP Top 10 checks |
| `refactoring-checklist` | Safe refactoring steps |
| `requirements-discovery` | User stories, PRD structure |
| `docs-structure` | README, API docs templates |
| `performance-profiling` | Measure-first optimization |
| `code-review` | PR review checklist |
| `feature-planning` | Task blocks for subagent hand-off |
| `postgresql` | Schema design, indexing, pgvector, RAG pipelines |
| `nosql-databases` | MongoDB, Convex, document stores—indexing, query optimization |

See `.cursor/skills/README.md` for the full mapping to agents.

### 📐 Rules (6)

Rules in `.cursor/rules/` provide persistent AI guidance:

| Rule | Scope | Purpose |
|------|-------|---------|
| `core-standards` | Always | General coding standards |
| `compounding-dev-cycle` | Always | Plan → Code → Review/Test → Plan with clear handoffs between agents |
| `typescript` | `**/*.ts` | TypeScript conventions |
| `react` | `**/*.tsx` | React component patterns |
| `api-routes` | `**/api/**/*.ts` | API validation and error handling |
| `e2e-tests` | `**/*.spec.ts` | Playwright E2E patterns |

See `.cursor/rules/README.md` for details.

### 🪝 Hooks

**Why hooks?** Hooks let you observe, control, and extend the agent loop automatically. Use them to:
- **Enforce consistency** — Run Prettier/ESLint after every file edit
- **Add safety guards** — Block risky commands (`rm -rf`, `kubectl apply`) or require approval for network calls
- **Audit activity** — Log commands, file edits, and MCP usage for compliance or debugging
- **Inject context** — Add env vars or project context at session start
- **Gate access** — Block reads of sensitive files or scans of prompts for PII

**How hooks work in this project:** Hooks support the compounding development cycle in two ways. (1) **Session context** — At session start, `session-init.sh` injects a reminder so the agent follows Plan → Code → Review/Test → Plan, uses the plan doc as the single source of truth, and knows to run feature-plan first and project-manager for the full cycle. (2) **Consistency and traceability** — After every file edit, `format.sh` runs Prettier so Code-phase output stays consistent with project style and Review/Test sees clean diffs. Before and after shell commands, on session end, and when the agent loop stops, `audit.sh` logs events to `.cursor/hooks/audit.log`, giving you a traceable record of what ran and when—so handoffs and rework follow-up are easier.

**Included hooks:**

| Event | Script | Purpose |
|-------|--------|---------|
| sessionStart | session-init.sh | Inject compounding-cycle reminder and plan-first context |
| afterFileEdit | format.sh | Run Prettier on edited files (keeps Code output consistent) |
| beforeShellExecution | audit.sh | Log “command about to run” to audit.log |
| afterShellExecution | audit.sh | Log “command finished” to audit.log |
| sessionEnd | audit.sh | Log session end (session boundaries for traceability) |
| stop | audit.sh | Log when agent loop ends |

**Examples:** Block risky commands, audit all activity, inject session context, block sensitive file reads—see `.cursor/hooks/README.md` for detailed examples and when/how to use each hook.

Run `chmod + x .cursor/hooks/*.sh` after installation.

## Customization

After installation, you can customize any command by editing files in `.cursor/commands/` and `.cursor/agents/`. Add or modify skills in `.cursor/skills/`, rules in `.cursor/rules/`, and hooks in `.cursor/hooks.json` to extend agent capabilities.

## Contributing

**Developers:** See **DEV-GUIDE.md** for how the extension is set up (e.g. why we don’t add a `.claude` folder to the repo, packaging, adapters). Open it via the command **Payoy's Setup: Open Developer Guide**.

Feel free to:
- Fork and customize for your needs
- Submit issues or suggestions
- Share your improvements

## License

MIT - Use freely in your projects

## Author

Created by Brader Payoy

### Shoutout

This project was inspired by Edmun Yong's claude-code agents on GitHub—huge thanks to him for the original idea. The workflows here build on his approach, tailored specifically for Cursor.

---

**Note**: Commands are optimized for Next.js + Supabase workflows but work great with any modern web stack.
