# Plan-Code-Review workflow (Plan → Code → Review/Test)

Apply these rules and use the referenced agent perspectives when working in this repo.

## Rules

### api routes

# API Routes

## Validation
- Validate all input at the route boundary before business logic
- Use a schema library (Zod, Yup) for request body, query, and params
- Return 400 for invalid input with field-level error details

## Response Shape
- Success: return the resource or `{ data: ... }`; use 200 (GET/PUT/PATCH), 201 (POST), 204 (DELETE)
- Errors: use consistent shape: `{ error: { code: string, message: string, details?: array } }`
- Never expose stack traces, internal paths, or sensitive data in production

## Status Codes
| Code | Use case |
|------|----------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Bad request, validation failed |
| 401 | Unauthorized, not authenticated |
| 403 | Forbidden, authenticated but not allowed |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate) |
| 500 | Server error (log details, return generic message) |

## Security
- Authenticate and authorize before processing; return 401/403 early
- Validate content-type and body size; reject unexpected payloads
- Use parameterized queries; never concatenate user input into SQL
- Rate limit sensitive endpoints (auth, password reset)

## Structure
- Keep route handlers thin; delegate to service/use-case layer
- Use try/catch; map known errors to status codes; log unexpected errors
- Document endpoints (OpenAPI/JSDoc) with params, body, and response shapes

### compounding dev cycle

# Compounding Development Cycle

Follow **Plan → Code → Review/Test → Plan** for every feature or change. Each phase produces handoff artifacts so the next agent can continue without loss of context. **Switch modes explicitly** as you progress through phases; each mode has distinct responsibilities and output expectations.

---

## Mode switching

Each mode has distinct responsibilities and output expectations.

### ASK mode (Phase 1a: Plan discovery)

- **Entry:** When receiving a user request without clear scope or acceptance criteria.
- **Behavior:** Ask clarifying questions; gather requirements; validate assumptions.
- **Output:** Structured requirements (may be informal notes or structured as RFC/issue).
- **Exit:** When scope, constraints, and success criteria are unambiguous.

### PLAN mode (Phase 1b: Plan authoring)

- **Entry:** After ASK completes (or when scope is already clear); begin authoring the plan artifact.
- **Behavior:** Write scope, acceptance criteria, technical approach, and task list; reference project rules.
- **Output:** Single written plan document (e.g. `docs/plans/<feature>.md` or ticket with complete AC).
- **Exit:** When another agent can implement from the plan without guessing.

### AGENT mode (Phases 2–3: Execute & review)

- **Entry:** After PLAN artifact is handed off.
- **Behavior:** Implement code (Phase 2), write tests, produce implementation notes; OR review/test and produce rework list (Phase 3).
- **Output:** Code changes + tests + implementation notes (Phase 2); OR review summary + rework list (Phase 3).
- **Exit/Loop:** If Critical rework items → new cycle (back to ASK or PLAN for rework scope); if no Critical issues → production ready.

---

## Mode transition guide

### Initial cycle: user request → production ready

1. **ASK** — User provides request; ask clarifying questions until scope is clear.
2. **PLAN** — Author plan doc with full scope, AC, approach, and task list.
3. **AGENT (Code)** — Implement to plan; produce code + tests + impl notes.
4. **AGENT (Review/Test)** — Validate against plan; produce rework list.
5. **Decision:** No Critical issues? → **Production ready**. Critical issues? → Go to step 6.

### Rework cycle: critical issues → production ready

6. **PLAN (brief)** — Turn rework items into new AC; update plan doc (e.g. `docs/plans/<feature>-rework-N.md`).
7. **AGENT (Code)** — Fix Critical items per rework list.
8. **AGENT (Review/Test)** — Re-validate; produce new rework list.
9. **Loop** — Repeat from step 6 until no Critical issues → **Production ready**.

### Quick tips

- **ASK mode:** Stay until you can write unambiguous AC.
- **PLAN mode:** Don't jump to code until plan is reviewed and locked.
- **AGENT mode:** Respect the plan; changes to scope = new PLAN cycle.
- **Handoffs:** Each phase ends with explicit artifacts (written, not verbal).

---

## 1. Plan

**Goal:** Unambiguous scope, acceptance criteria, and technical approach before implementation.

**Modes:** When scope is unclear, run **ASK** (Plan discovery) first; then **PLAN** (Plan authoring). When the user request already has clear scope and AC, go directly to **PLAN**.

**Inputs:** User request, existing codebase, constraints (deadlines, stack, standards).

**Outputs (handoff to Code):**
- **Scope:** What is in/out; dependencies and boundaries.
- **Acceptance criteria:** Testable conditions (Given/When/Then or checklist).
- **Technical approach:** Key components, APIs, data shapes; references to existing rules (e.g. `core-standards.md`, `api-routes.md`).
- **Task list:** Ordered implementation steps; optional rough file/area mapping.

**Artifact:** Prefer a single plan doc (e.g. `docs/plans/<feature>.md` or ticket) that Code can open and follow. Use `feature-plan` to produce the plan file; use `project-manager` with that plan to run the full cycle (Code → Review/Test → Plan if needed → repeat until production ready).

**Agents:** requirements-analyst (discovery), tech-stack-researcher (choices), backend-architect / frontend-architect (design). One agent can own the final plan; others feed into it.

**Handoff rule:** Plan is complete when another agent can implement without guessing scope or acceptance.

---

## 2. Code

**Goal:** Implement exactly to the plan; preserve handoff for Review/Test.

**Mode:** **AGENT** (Execute). No planning or discovery; implement only to the plan artifact.

**Inputs:** Plan artifact, project rules (core-standards, api-routes, typescript, react, e2e-tests), existing code.

**Outputs (handoff to Review/Test):**
- **Implementation:** Code that satisfies acceptance criteria and project standards.
- **Tests:** Unit/integration/API tests for new behavior; follow `api-test` / E2E patterns where relevant.
- **Implementation notes:** Short list of what was done, what was deferred, and any assumptions or env/config changes. Use this minimal template for consistency:
  - **Done:** What was implemented (and which AC it maps to, if applicable).
  - **Deferred:** What was explicitly postponed with a brief reason.
  - **Assumptions:** Any assumptions about environment, dependencies, or behavior.
  - **Env/config:** Required env vars, config changes, or setup steps.

**Discipline:** Do not expand scope beyond the plan without updating the plan first. If the plan is wrong, note it and either adjust the plan doc or hand back to Plan for a quick revision.

**Agents:** backend-architect, frontend-architect, database-expert, or general implementation. Match agent to the changed areas.

**Handoff rule:** Review/Test must see a clear diff, the plan’s acceptance criteria, and the implementation notes so they can verify and test.

---

## 3. Review / Test

**Goal:** Verify behavior, standards, and security; produce a clear pass/fail and rework list.

**Mode:** **AGENT** (Review/Test). Read-only review output (rework list, summary); do not apply changes unless explicitly asked.

**Inputs:** Plan (acceptance criteria), code diff, implementation notes, test results.

**Outputs (handoff to Plan or Code):**
- **Review summary:** Alignment with plan, adherence to core-standards and api-routes, security and performance notes.
- **Test status:** Which acceptance criteria are covered; any failing or missing tests.
- **Rework list:** Concrete, actionable items (file/line or component + required change + **severity**). Severity: **Critical** (must fix before production), **Suggestion**, **Nice to have**. No vague “improve X.”

**Gates:** All acceptance criteria covered by tests; no known violations of project rules; no unresolved high-severity security or data-integrity issues. **Code is production ready when gates pass and there are no Critical rework items.**

**Agents:** backend-reviewer, frontend-reviewer (project-manager triggers these **code reviewers** automatically after Code); optionally security-engineer, performance-engineer when in scope. **E2E testing is not auto-triggered**—the user runs it when they want (e.g. e2e-runner or running the test suite).

**Handoff rule:** If there are **Critical** rework items or gates not passed, feed back into **Plan** (rework = new AC), then **Code** (fix), then **Review/Test** again. Repeat until gates pass and no Critical issues—then code is **finalized and production ready**. If only trivial/suggestion rework, hand to **Code** with the rework list and re-run Review/Test.

---

## 4. Plan (next iteration)

**Goal:** Treat rework or new scope as a new cycle so nothing is dropped.

**Mode:** **PLAN** (brief). Rework plan only; no implementation until Code phase.

**Inputs:** Rework list from Review/Test (especially **Critical** items), or new user request.

**Process:** Turn rework items into a short plan (scope = fixing issues, acceptance criteria = each critical item resolved, tasks for Code). Then **Code** (implement fixes) → **Review/Test** (backend-reviewer, frontend-reviewer only; E2E remains user-triggered) again. **project-manager runs this loop automatically:** when Review/Test reports critical issues, it creates the rework plan, spawns Code agents to fix, triggers Review/Test again, and repeats until there are no critical issues and gates pass—then declares code **production ready**.

---

## Cross-phase standards

- **Consistency:** All phases respect `core-standards.md` and domain rules (`api-routes.md`, etc.).
- **Traceability:** Link code and review back to the plan (e.g. “implements AC-1, AC-2” in commits or PR description).
- **Single source of truth:** The plan doc is the contract; change it when scope or criteria change, then proceed.
- **Smooth handoff:** Each phase ends with written artifacts the next phase needs; avoid “verbal” handoffs only.

### core standards

# Core Standards

## Type Safety
- Prefer explicit types over `any`; use `unknown` when type is truly unknown, then narrow
- Avoid type assertions (`as`) unless necessary; prefer type guards or better typing

## Error Handling
- Handle errors explicitly; never swallow with empty `catch` blocks
- Log errors before rethrowing; include context (e.g., operation name, input summary)
- Use custom error classes for domain-specific failures when helpful

## Function Design
- Keep functions focused on one concern; extract when they exceed ~30 lines
- Prefer pure functions when possible; isolate side effects at boundaries
- Use early returns and guard clauses to reduce nesting

## Naming
- Use meaningful names; avoid abbreviations except common ones (`id`, `url`, `err`, `req`, `res`)
- Booleans: `isLoading`, `hasError`, `canEdit`
- Functions: verb-first (`fetchUser`, `validateInput`, `formatDate`)

## General
- Prefer `const` over `let`; avoid `var`
- Avoid magic numbers and strings; extract to named constants
- Comment *why*, not *what*; code should be self-explanatory

### e2e tests

# E2E Tests

## Selectors
- **Prefer**: `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByTestId`
- **Avoid**: Deep CSS selectors, `:nth-child`, XPath for layout—they break on refactors
- Add `data-testid` when role/label are insufficient; keep IDs stable and semantic

## Waiting
- Rely on Playwright auto-waiting; avoid `page.waitForTimeout()` (causes flakiness)
- Use `expect(locator).toBeVisible()` or `locator.click()` (auto-waits before click)
- For network: `page.waitForResponse()`, `page.waitForRequest()` when needed

## Test Design
- Each test must run in isolation; no shared mutable state between tests
- Use `beforeEach` for setup; seed or reset data per test
- Use unique test data (timestamps, UUIDs) to avoid collisions in parallel runs

## Structure
- Use Page Object Model for reusable page interactions; keep tests readable
- Group tests by feature or user flow with `test.describe`
- Assert outcomes, not implementation; test what the user sees and does

## Reliability
- Keep individual tests under ~30 seconds; split long flows if needed
- Use `trace: 'on-first-retry'` and `screenshot: 'only-on-failure'` for debugging
- Run tests locally before pushing; fix flakiness immediately—never ignore

### react

# React

## Component Structure
- Use functional components and hooks; avoid class components for new code
- Keep components under ~100 lines; extract subcomponents or custom hooks when larger
- Colocate related logic (state, effects) with the component; extract to hooks when reused

## Accessibility
- Ensure every form input has an associated `<label>` (use `htmlFor`/`id` or wrap)
- Use semantic HTML: `<button>` for actions, `<a>` for navigation, headings in order
- Add `data-testid` for elements that need E2E selectors when role/label are insufficient
- Support keyboard navigation; avoid `tabIndex` except to fix focus order

## State & Data
- Prefer server components when no client interactivity is needed
- Use `useState` for local UI state; lift state only when necessary
- Fetch data at the appropriate level; avoid prop drilling—use context or composition

## Performance
- Memoize expensive computations with `useMemo`; memoize callbacks with `useCallback` when passing to memoized children
- Use `React.lazy` and `Suspense` for code-splitting large routes or components
- Avoid inline object/array creation in JSX props (causes unnecessary re-renders)

## Patterns
- Extract reusable UI into small, composable components
- Use compound components or render props for flexible APIs
- Prefer composition over prop drilling; avoid "prop drilling" beyond 2–3 levels

### typescript

# TypeScript

## Types
- Avoid `any`; use `unknown` for truly unknown values, then narrow with type guards
- Prefer `interface` for object shapes; `type` for unions, intersections, and mapped types
- Use `strictNullChecks`; handle `null` and `undefined` explicitly
- Export types alongside the code that uses them; avoid separate type-only files unless shared

## Declarations
- Use `const` by default; `let` only when reassignment is needed
- Prefer `const` assertions for literal types: `as const`
- Use `readonly` for arrays/objects that should not be mutated

## Functions
- Always type function parameters and return types for public APIs
- Use optional params (`?`) or overloads for flexibility; avoid `any` in signatures
- Prefer `void` for functions that return nothing; avoid implicit `undefined` returns

## Imports
- Use `import type` for type-only imports to enable better tree-shaking
- Prefer named imports over default when exporting multiple items
- Avoid circular dependencies; extract shared types to a separate module if needed

## Examples
```typescript
// Good: explicit, narrow types
function parseUserId(input: unknown): string {
  if (typeof input !== 'string') throw new Error('Expected string');
  return input;
}

// Avoid: any bypasses type safety
function parseUserId(input: any): string { ... }
```

## Agent roles (apply when relevant)

- **ai-automation-expert**: Writes high-quality skills, agent definitions, and workflows for AI to follow. Use when asked to create or refine technical skills, agent workflows, automation instructions, or SKILL.md/agent.md content with strict rules, styles, and philosophy.
- **architecture-strategist**: "Analyzes code changes from an architectural perspective for pattern compliance and design integrity. Use when reviewing PRs, adding services, or evaluating structural refactors."
- **backend-architect**: Design reliable backend systems with focus on data integrity, security, and fault tolerance
- **backend-reviewer**: Review backend code for correctness, security, API contract, and data integrity; produce concrete rework lists for the Plan→Code cycle
- **database-expert**: Optimize queries and ensure data access follows best practices with deep DBA expertise
- **deep-research-agent**: Specialist for comprehensive research with adaptive strategies and intelligent exploration
- **e2e-runner**: Design and execute best-in-class end-to-end tests with focus on reliability, coverage, and maintainability
- **frontend-architect**: Create accessible, performant user interfaces with focus on user experience and modern frameworks
- **frontend-reviewer**: Review frontend code for correctness, accessibility, performance, and standards; produce concrete rework lists for the Plan→Code cycle
- **learning-guide**: Teach programming concepts and explain code with focus on understanding through progressive learning and practical examples
- **pattern-recognition-specialist**: "Analyzes code for design patterns, anti-patterns, naming conventions, and duplication. Use when checking codebase consistency or verifying new code follows established patterns."
- **performance-engineer**: Optimize system performance through measurement-driven analysis and bottleneck elimination
- **refactoring-expert**: Improve code quality and reduce technical debt through systematic refactoring and clean code principles
- **requirements-analyst**: Transform ambiguous project ideas into concrete specifications through systematic requirements discovery and structured analysis
- **security-engineer**: Identify security vulnerabilities and ensure compliance with security standards and best practices
- **system-architect**: Design scalable system architecture with focus on maintainability and long-term technical decisions
- **tech-stack-researcher**: Use this agent when the user is planning new features or functionality and needs guidance on technology choices, architecture decisions, or implementation approaches. Examples include: 1) User mentions 'planning' or 'research' combined with technical decisions (e.g., 'I'm planning to add real-time notifications, what should I use?'), 2) User asks about technology comparisons or recommendations (e.g., 'should I use WebSockets or Server-Sent Events?'), 3) User is at the beginning of a feature development cycle and asks 'what's the best way to implement X?', 4) User explicitly asks for tech stack advice or architectural guidance. This agent should be invoked proactively during planning discussions before implementation begins.
- **technical-writer**: Create clear, comprehensive technical documentation tailored to specific audiences with focus on usability and accessibility

---
*Generated by Plan-Code-Review Workflow extension for GitHub Copilot.*

---

## Skills (use when relevant)

- **accessibility-checklist**: Verify WCAG 2.1 AA compliance for UI components. Use when building or reviewing frontend components, implementing accessibility, or working with frontend-architect.
- **agent-selection**: Select and load relevant agent definitions before a task. Use when a command or workflow needs to apply specialized agent perspectives (backend, frontend, security, etc.) without duplicating the full agent list in every command.
- **api-design-patterns**: Apply RESTful and API design best practices for endpoints, error handling, validation, and versioning. Use when designing APIs, creating new endpoints, or reviewing API structure with backend-architect.
- **api-testing**: Structure and write API tests for endpoints, covering success, validation, auth, and error cases. Use when testing APIs, creating api-test scenarios, or validating backend endpoints with backend-architect.
- **backend-architect-skillset**: Skillset for backend design and implementation. Use when working on APIs, databases, or server-side code; load referenced skills when their context matches the task.
- **backend-reviewer-skillset**: Full criteria for reviewing backend code. Use when reviewing APIs, server logic, database access, or security; produce concrete rework lists for the Plan→Code cycle.
- **code-review**: Review code for correctness, security, maintainability, and style. Use when reviewing pull requests, examining code changes, or performing code review.
- **docs-structure**: Structure technical documentation for APIs, guides, and README. Use when writing docs, README, API references, or working with technical-writer.
- **e2e-playwright**: Write reliable Playwright E2E tests with Page Object Model, stable selectors, and proper waits. Use when creating or maintaining E2E tests with e2e-runner.
- **feature-planning**: Break features into implementation tasks for backend, frontend, and E2E subagents. Use when planning features, creating implementation plans, or running feature-plan command. Plan mode only—no implementation.
- **frontend-architect-skillset**: Skillset for frontend design and implementation. Use when working on UI, components, accessibility, or client-side code; load referenced skills when their context matches the task.
- **frontend-reviewer-skillset**: Full criteria for reviewing frontend code. Use when reviewing UI components, accessibility, performance, or client-side logic; produce concrete rework lists for the Plan→Code cycle.
- **nosql-databases**: Apply NoSQL best practices for MongoDB, Convex, and document databases. Use when designing schemas, writing queries, optimizing performance, or building applications with non-relational databases. Use with database-expert for query optimization and DBA-level tuning (20+ years experience).
- **performance-profiling**: Measure before optimizing; identify bottlenecks with data. Use when optimizing performance, profiling, or working with performance-engineer.
- **postgresql**: Apply PostgreSQL best practices for schema design, indexing, transactions, vector search (pgvector), and RAG pipelines. Use when designing schemas, writing queries, optimizing performance, implementing semantic search, or building RAG applications with PostgreSQL. Use with database-expert for query optimization and DBA-level tuning.
- **project-manager**: Orchestrate the compounding development cycle (Plan → Code → Review/Test → Plan) with strict phase rules and automatic mode switching (ASK → PLAN → AGENT). Use when running project-manager command, delegating to implementation/review agents, or ensuring handoffs follow the rule’s Mode transition guide.
- **refactoring-checklist**: Apply safe refactoring steps with behavior preservation. Use when refactoring code, reducing technical debt, or working with refactoring-expert.
- **requirements-discovery**: Structure requirements discovery and produce PRDs, user stories, and acceptance criteria. Use when clarifying requirements, gathering specs, or working with requirements-analyst.
- **security-audit**: Perform OWASP-aligned security checks on code and APIs. Use when auditing for vulnerabilities, reviewing security, or working with security-engineer.
