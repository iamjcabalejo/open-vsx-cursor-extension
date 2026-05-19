# Plan-Code-Review workflow (Plan → Code → Review/Test)

Follow the compounding dev cycle and apply these rules and agent roles.

## Mode mapping (Codex + cross-assistant)

Use Codex behavior explicitly by phase:

- **Plan/discovery:** plan-before-execute behavior (planning only; no implementation).
- **Implementation:** agent execution behavior (code changes and tests).
- **Review/explanation:** read-only review behavior (no edits unless explicitly requested).

Cross-assistant equivalence:

- Cursor: Plan / Agent / Ask
- Claude Code: Plan / Normal (or Auto-accept) / Plan-or-Normal-read-only
- GitHub Copilot: Plan / Agent / Ask

## Token policy (always on)

Apply **token-policy** below in every session (also in `~/.codex/rules/token-policy.md` when installed): refine → hand off, concise but complete responses, lean diffs, internal XML blueprints for complex work.

## Rules

### token policy

# TokenPolicy

**Authoritative** for how the agent spends context. `core-standards` and `compounding-dev-cycle` in this file point here; stack rules are additive.

**Goal:** Spend context on actions and decisions. Avoid noise, repeated reads, and oversized replies.

**Session entry flow:** Ingest → **refine** (objective, scope, constraints; XML blueprint when complex) → **hand off** a tight spec to skills/agents—not a restatement. Layers on compounding-dev-cycle (ASK → PLAN → AGENT).

**Responses:** Concise and complete; no filler or engagement bait; substance first. **Code:** smallest diff; code citations; batch reads; search before full-file read. **Complex work:** short internal XML blueprint (`<role>`, `<task>`, `<forbidden>`, `<error_handling>`, `<output_format>`, optional `<analysis>`). Full pattern: extension README → Why XML beats a single prose prompt; or `~/.codex/rules/token-policy.md`.

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
- Comment _why_, not _what_; code should be self-explanatory

**Session communication:** Answer shape, handoff brevity, and batched tool use follow **token-policy** above; domain rules below are additive. On conflict about verbosity or diffs, **token-policy wins**.

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

## Security

- Authenticate and authorize before processing; return 401/403 early
- Use parameterized queries; never concatenate user input into SQL

## Structure

- Keep route handlers thin; delegate to service/use-case layer
- Use try/catch; map known errors to status codes; log unexpected errors

### typescript

# TypeScript

- Avoid `any`; use `unknown` for truly unknown values, then narrow with type guards
- Prefer `interface` for object shapes; `type` for unions and mapped types
- Use `strictNullChecks`; handle `null` and `undefined` explicitly
- Always type function parameters and return types for public APIs

### react

# React

- Use functional components and hooks; keep components under ~100 lines
- Ensure every form input has an associated `<label>`; use semantic HTML
- Add `data-testid` when role/label are insufficient for E2E
- Memoize expensive computations with `useMemo`; use `React.lazy` for code-splitting

### e2e tests

# E2E Tests

- Prefer `getByRole`, `getByLabelText`, `getByTestId`; avoid deep CSS selectors
- Rely on Playwright auto-waiting; avoid `page.waitForTimeout()`
- Use Page Object Model; assert outcomes, not implementation

### compounding dev cycle

Follow **Plan → Code → Review/Test → Plan** for every feature. **First** apply token-policy **Session entry flow** (refine → hand off), then ASK/PLAN/AGENT. See user-level AGENTS.md (~/.codex/AGENTS.md) for full cycle; prose in each phase is lean per token-policy.

## Agents (use when relevant)

Skills for each agent live in `~/.codex/skills/<name>/SKILL.md`. Apply the compounding dev cycle (Plan → Code → Review/Test → Plan) and link work to acceptance criteria.

- **backend-architect**: Design reliable backend systems with focus on data integrity, security, and fault tolerance
- **backend-reviewer**: Full criteria for reviewing backend code; produce concrete rework lists
- **frontend-architect**: Accessible, performant UIs; load accessibility and E2E skills when relevant
- **frontend-reviewer**: Review frontend code for correctness, accessibility, performance
- **database-expert**: Schema design, queries, indexing; PostgreSQL and NoSQL best practices
- **refactoring-expert**: Safe refactoring steps with behavior preservation
- **performance-engineer**: Measure before optimizing; identify bottlenecks with data
- **e2e-runner**: Reliable Playwright E2E tests with Page Object Model
- **security-engineer**: OWASP-aligned security checks on code and APIs
- **requirements-analyst**: Structure requirements discovery; produce PRDs and acceptance criteria
- **technical-writer**: Clear technical documentation for APIs, guides, README
- **architecture-strategist**: Analyze changes for pattern compliance and design integrity
- **system-architect**: Scalable system architecture and long-term technical decisions
- **pattern-recognition-specialist**: Design patterns, anti-patterns, naming conventions
- **learning-guide**: Teach programming concepts and explain code
- **deep-research-agent**: Comprehensive research with adaptive strategies
- **tech-stack-researcher**: Technology choices and implementation approaches

---

_Generated by Plan-Code-Review Workflow extension for Codex._
