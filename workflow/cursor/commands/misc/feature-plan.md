---
description: Create a feature plan file for the compounding cycle (Plan mode only). Output is for project-manager.
model: claude-sonnet-4-5
---

**Scope of this command:** This command produces **only** a feature plan document. It runs in **Plan mode** at all times: planning only, no implementation. It does **not** spawn Code or Review agents. For the full cycle, run **project-manager** with the plan path after this command.

## Cursor mode: Plan mode only (strict)

You MUST run this command in **Plan mode**. Do not implement code, create application files, or run build/test commands. Your only allowed output is the plan document (and writing it to `docs/plans/<feature-slug>.md`). If the user or context asks you to "also implement" or "start coding," decline and remind them: feature-plan is planning only; use project-manager with this plan to run Code ? Review/Test.

## Clarification-first planning (interactive)

Before writing the final plan, ask relevant clarifying questions when any requirement is ambiguous or missing. Focus on business goal, in-scope vs out-of-scope, target users, constraints, dependencies, integration points, edge cases, non-functional requirements (security/performance), and acceptance criteria. Do not invent missing details.

If details are unclear:
1. Ask concise, high-impact follow-up questions.
2. Wait for answers (or explicitly mark assumptions if the user asks to proceed without answers).
3. Reflect the resolved clarifications in the final plan.

## Rules to follow

- **Compounding cycle:** Follow the **Plan** phase in `.cursor/rules/compounding-dev-cycle.mdc` (scope, acceptance criteria, technical approach, task list; handoff rule: plan complete when another agent can implement without guessing).
- **Project-manager handoff:** Align with `.cursor/skills/project-manager/SKILL.md`: Plan phase uses Plan mode; your output feeds the next phase (project-manager runs Code in Agent mode, then Review/Test in Ask mode).
- **Feature-planning skill:** Apply `.cursor/skills/feature-planning/SKILL.md` so the plan includes all required sections for project-manager.

## Feature / plan target

$ARGUMENTS

**Interpret the arguments as:** a feature name or slug (e.g. `user-profile`, `auth-login`). The plan file path MUST be `docs/plans/<feature-slug>.md` (e.g. `docs/plans/user-profile.md`). If the user provides a path, use it only if it is under `docs/plans/`; otherwise derive the slug and use `docs/plans/<slug>.md`. If arguments are empty, ask the user for the feature name or slug.

## Required plan sections (strict)

Include every section below so **project-manager** can load and delegate without guessing. Use the feature-planning skill for task-block structure.

1. **Scope / Metadata** (optional but recommended)
   - `Security: critical` or `Performance: critical` when the feature has security or performance acceptance criteria (so project-manager can spawn security-engineer or performance-engineer in Review).

2. **Feature Overview**
   - Problem, audience, key functionality.

3. **Acceptance criteria**
   - Testable conditions (Given/When/Then or checklist). Number them (AC-1, AC-2, ?) for traceability.

4. **Technical design**
   - Components, endpoints, schema, data flow; references to `core-standards.mdc`, `api-routes.mdc` where relevant.

5. **Backend tasks**
   - For backend-architect (and database-expert when DB-heavy). Setup ? Database ? API ? Security. Dependencies, env vars, file changes.

6. **Frontend tasks**
   - For frontend-architect. Components ? Pages ? Integration ? Polish. API contract, file changes.

7. **Integration & testing**
   - For e2e-runner. E2E flows, critical path coverage.

8. **File changes**
   - New and modified files (list).

9. **Dependencies / env**
   - Packages, env vars, config changes.

## Detailed output format (mandatory)

Produce a **detailed** plan so project-manager and implementers can work without guessing. For each section, include the level of detail below.

### Task analysis / metadata (at top of plan, after title)
- **Type**: [Feature / Bug Fix / Refactor / Infrastructure]
- **Complexity**: [Small / Medium / Large / Very Large] with 1?2 sentence justification
- **Estimated effort**: X hours or days (Small: 1?2h, Medium: 0.5?1 day, Large: 2?5 days, Very Large: 1+ week)
- **Priority**: [High / Medium / Low] (optional, if known)

### Scope / metadata
- In scope: short bullet list of what is included
- Out of scope: what is explicitly excluded (or "None" if N/A)
- Security: `Security: critical` or omit
- Performance: `Performance: critical` or omit

### Feature overview
- **Problem**: 2?4 sentences on the problem or opportunity
- **Audience**: Who uses this (e.g. end users, admins, API consumers)
- **Key functionality**: 3?6 bullet points of main capabilities

### Acceptance criteria
- One criterion per bullet; each testable (Given/When/Then or clear pass/fail)
- Number every criterion: AC-1, AC-2, AC-3, ?
- Cover happy path and critical edge cases (auth, errors, empty states)

### Technical design
- **Components / modules**: Named components, layers, or modules and their responsibility (1?2 sentences each)
- **Endpoints / APIs**: For each endpoint: method, path, brief purpose, request shape (key fields), response shape (key fields), errors
- **Data model / schema**: Main entities, key fields, relationships; DB tables or collections if applicable
- **Data flow**: Short description of how data moves (e.g. client ? API ? DB ? response)
- **References**: Mention `core-standards.mdc`, `api-routes.mdc` (or other project rules) where they apply

### Backend tasks
- **Phase 1 ? Setup**: Env vars, config, new packages; list concrete file changes
- **Phase 2 ? Database** (if any): Schema changes, migrations, indexes; list files and key operations
- **Phase 3 ? API**: Per endpoint or area: steps as checkboxes (e.g. `- [ ] Add GET /api/...`, `- [ ] Validate input`, `- [ ] Return 404 when not found`)
- **Phase 4 ? Security** (if any): Auth, permissions, validation
- For each phase: list **file changes** (path + create/modify) and **dependencies/env** (packages, env vars)

### Frontend tasks
- **Phase 1 ? Components**: Per component: name, responsibility, props/API; file path (create/modify)
- **Phase 2 ? Pages / views**: Routes, layout, data loading; file changes
- **Phase 3 ? Integration**: API client usage, state, error handling; which backend endpoints are called
- **Phase 4 ? Polish**: Loading states, a11y, validation UX
- Include **API contract** summary: which endpoints the frontend calls and with what payloads

### Integration & testing
- **E2E flows**: Named user journeys (e.g. "User can sign up and see dashboard") with 3?6 steps each
- **Critical paths**: List flows that must be covered by E2E
- **Unit / integration**: Which areas need unit tests (e.g. API handlers, utils) or integration tests (e.g. DB + API)

### File changes
- Explicit list in a code block or table, e.g.:
  - `path/to/file.ts` (create)
  - `path/to/other.ts` (modify)
- Group by area (backend, frontend, shared, config) if helpful

### Dependencies / env
- **Packages**: Exact package names and purpose (e.g. `zod` for validation); optional version if project pins
- **Env vars**: Name, purpose, example value (e.g. `API_KEY=...`), required vs optional
- **Config changes**: Config files or keys to add/change

### Risks / potential issues (recommended)
- 2?5 bullets: unknown dependencies, migration risks, breaking changes, third-party limits, performance considerations
- For each: brief mitigation or "TBD"

### Next steps (recommended)
- 1. Run project-manager with this plan
- 2. (Optional) Any prep the user should do before running project-manager

## Agent definitions (planning perspective only)

**Apply the agent-selection skill** (`.cursor/skills/agent-selection/SKILL.md`): identify relevant agents for **planning** (not implementation), read their definitions from `.cursor/agents/`, and apply their perspective to the plan.

**Relevant agents for this command (planning only):** requirements-analyst, tech-stack-researcher, backend-architect, frontend-architect, system-architect, database-expert (when DB-heavy). Use them to inform scope, AC, and task blocks?do not spawn them for Code or Review.

## Output

1. **Write the plan** to `docs/plans/<feature-slug>.md` using **all** required sections and the **detailed output format** above. The plan must be detailed enough that backend-architect, frontend-architect, and e2e-runner can implement and test without guessing scope, APIs, or file locations.
2. **Confirm** the plan path and remind the user: "Run **project-manager** with this plan to execute Code ? Review/Test (e.g. `/project-manager docs/plans/<feature-slug>.md`). This command used **Plan mode** only; no implementation was performed."

**Quality bar:** If any section would be vague or one-line, expand it with the level of detail specified in "Detailed output format (mandatory)." Prefer concrete file paths, endpoint signatures, and step-by-step task checkboxes over high-level descriptions.

Do not suggest manual handoff without the plan file path. Do not implement or modify application code.
