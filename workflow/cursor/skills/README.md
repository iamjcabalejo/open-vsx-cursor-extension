# Project Skills

Skills in `.cursor/skills/` provide reusable workflows and checklists for backend, frontend, and other domains. Use them with any AI assistant (e.g. Cursor, Codex, GitHub Copilot, Claude); they apply when the task matches the skill’s context.

## Mode mapping by assistant

Apply this mapping whenever a skill is used:

| Intent | Cursor | Claude Code | GitHub Copilot | Codex |
|--------|--------|-------------|----------------|-------|
| Planning / discovery | Plan mode | Plan mode | Plan mode | Plan-before-execute behavior (planning only) |
| Implementation | Agent mode | Normal or Auto-accept | Agent mode | Agent execution mode |
| Review / explanation (read-only) | Ask mode | Plan mode or Normal with no edits | Ask mode | Read-only review behavior |

For planning skills (for example `feature-planning`, `requirements-discovery`, `project-manager` planning phases), stay in planning mode and do not implement.

## Token-Efficient Writing Standard (always on)

Apply token-efficient mode to all skill-driven responses.

- **Default intensity:** `full` (`lite` and `ultra` supported when explicitly chosen).
- **Rule:** concise but complete; preserve required structures, checklists, and technical accuracy.
- **Auto-clarity override:** switch to explicit full-language wording for destructive/security-sensitive/irreversible guidance.
- **No ambiguous compression:** never remove preconditions, warnings, or pass/fail criteria from outputs.

### RiskControls
- **R-1:** clarity regression prevented by auto-clarity override.
- **R-2:** policy text must stay semantically aligned with Codex/Copilot/Claude skill docs.
- **R-3:** required command or skill sections are immutable.
- **R-4:** `lite/full/ultra` semantics remain identical across ecosystems.

## Backend and frontend skillsets

Two folders are **single entry points** for backend and frontend work. Any assistant can use them; no agent or role model is required.

| Folder | Domain | Purpose |
|--------|--------|---------|
| `.cursor/skills/backend-architect/` | Backend | Skillset for APIs, databases, server-side: when to load api-design-patterns, api-testing, postgresql, nosql-databases, refactoring-checklist, code-review |
| `.cursor/skills/frontend-architect/` | Frontend | Skillset for UI, components, a11y: when to load accessibility-checklist, performance-profiling, refactoring-checklist, e2e-playwright, code-review |

For backend or frontend tasks, read that folder’s `SKILL.md` first; it points to the underlying skills in `.cursor/skills/<skill>/SKILL.md`.

## Code reviewer skillsets

Two folders are **single entry points** for reviewing backend and frontend code. Use them with any AI assistant.

| Folder | Domain | Purpose |
|--------|--------|---------|
| `.cursor/skills/backend-reviewer/` | Backend review | Skillset for reviewing APIs, server logic, DB: code-review, api-design-patterns, api-testing, security-audit |
| `.cursor/skills/frontend-reviewer/` | Frontend review | Skillset for reviewing UI, a11y, perf: code-review, accessibility-checklist, performance-profiling, e2e-playwright |

When reviewing backend or frontend code, read that folder’s `SKILL.md` first; it points to the underlying skills and what to check.

## Skills by Agent

| Skill | Agent(s) | Purpose |
|-------|----------|---------|
| `api-design-patterns` | backend-architect, backend-reviewer | REST conventions, error handling, validation |
| `api-testing` | backend-architect, backend-reviewer, api-test | API test structure, assertions, coverage |
| `postgresql` | backend-architect, database-expert | Schema design, indexing, pgvector, RAG, query optimization |
| `nosql-databases` | backend-architect, database-expert | MongoDB, Convex, document stores—indexing, query optimization, schema design |
| `refactoring-checklist` | backend-architect, frontend-architect, refactoring-expert | Safe refactoring steps, behavior preservation |
| `code-review` | All (backend-architect, frontend-architect, backend-reviewer, frontend-reviewer for their domain) | PR review checklist |
| `accessibility-checklist` | frontend-architect, frontend-reviewer | WCAG 2.1 AA compliance checks |
| `performance-profiling` | frontend-architect, frontend-reviewer, performance-engineer | Measure-first optimization (frontend: Core Web Vitals, bundle) |
| `e2e-playwright` | frontend-architect, frontend-reviewer, e2e-runner | Playwright patterns, POM, selectors (frontend aligns components for E2E) |
| `security-audit` | security-engineer, backend-reviewer | OWASP Top 10 checklist |
| `requirements-discovery` | requirements-analyst | User stories, PRD structure |
| `docs-structure` | technical-writer | README, API docs, guides |
| `feature-planning` | feature-plan | Task blocks for subagent hand-off |

## Usage

Use the skill that fits the task (e.g. “review this API for security” → api-design-patterns or security-audit). You can say: “Use the accessibility-checklist skill when reviewing this component.” Works with any AI assistant; Cursor agents can map to the “Skills by Agent” table above.
