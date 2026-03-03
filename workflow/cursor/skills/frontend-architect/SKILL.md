---
name: frontend-architect-skillset
description: Skillset for frontend design and implementation. Use when working on UI, components, accessibility, or client-side code; load referenced skills when their context matches the task.
---

# Frontend Skillset

Single entry point for **frontend** work: UI components, accessibility, performance, and client-side implementation. Apply the skills below when their context matches the task. Read each skill from `.cursor/skills/<skill>/SKILL.md` when needed.

## Skills in this set

| Skill | Path | When to use |
|-------|------|-------------|
| `accessibility-checklist` | `.cursor/skills/accessibility-checklist/SKILL.md` | Building or reviewing UI—WCAG 2.1 AA, keyboard, screen readers, semantics |
| `performance-profiling` | `.cursor/skills/performance-profiling/SKILL.md` | Optimizing frontend—measure first (Core Web Vitals, bundle, load), then optimize |
| `refactoring-checklist` | `.cursor/skills/refactoring-checklist/SKILL.md` | Refactoring components or UI—safe steps, behavior preservation |
| `e2e-playwright` | `.cursor/skills/e2e-playwright/SKILL.md` | Components or flows that need E2E—stable selectors, POM, waits |
| `code-review` | `.cursor/skills/code-review/SKILL.md` | Reviewing frontend code or PRs—correctness, a11y, performance, style |

## How to use

When working on frontend tasks:

1. Read this file (`.cursor/skills/frontend-architect/SKILL.md`) first.
2. For the current task, determine which skills in the table apply.
3. Read those skill files from `.cursor/skills/<skill>/SKILL.md` and apply their guidance.

## Alignment

- Follow project rules: `core-standards.mdc`, `react.mdc` / `typescript.mdc` when in scope.
- Handoff: implementation notes, tests where required, and linkage to acceptance criteria per `compounding-dev-cycle.mdc`.
