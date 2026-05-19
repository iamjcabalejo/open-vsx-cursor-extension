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

## Session communication and context

- **Answer shape, handoff brevity, code citations vs pastes, and batched tool use** are defined in **`token-policy.md`**; follow that rule in every session. It also covers **refine → hand off** before agents/skills, and **internal XML task blueprints** for complex work.
- Domain rules in `.claude/rules/` (e.g. `typescript`, `api-routes`, `react`, `e2e-tests`) are **additive** for stack and file patterns. If something conflicts about how much to say or what to put in a diff, **`token-policy.md` wins** for the agent’s own communication.
