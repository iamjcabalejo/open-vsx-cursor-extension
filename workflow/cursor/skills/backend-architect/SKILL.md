---
name: backend-architect-skillset
description: Skillset for backend design and implementation. Use when working on APIs, databases, or server-side code; load referenced skills when their context matches the task.
---

# Backend Skillset

Single entry point for **backend** work: APIs, databases, security, and server-side implementation. Apply the skills below when their context matches the task. Read each skill from `.cursor/skills/<skill>/SKILL.md` when needed.

## Skills in this set

| Skill | Path | When to use |
|-------|------|-------------|
| `api-design-patterns` | `.cursor/skills/api-design-patterns/SKILL.md` | Designing or changing APIs—REST conventions, error handling, validation, versioning |
| `api-testing` | `.cursor/skills/api-testing/SKILL.md` | Adding or reviewing API tests—success, validation, auth, error cases, coverage |
| `postgresql` | `.cursor/skills/postgresql/SKILL.md` | Schema design, queries, indexing, pgvector, RAG, or any Postgres work |
| `nosql-databases` | `.cursor/skills/nosql-databases/SKILL.md` | MongoDB, Convex, or other document stores—schema, indexing, query optimization |
| `refactoring-checklist` | `.cursor/skills/refactoring-checklist/SKILL.md` | Refactoring backend code—safe steps, behavior preservation |
| `code-review` | `.cursor/skills/code-review/SKILL.md` | Reviewing backend code or PRs—correctness, security, maintainability |

## How to use

When working on backend tasks:

1. Read this file (`.cursor/skills/backend-architect/SKILL.md`) first.
2. For the current task, determine which skills in the table apply.
3. Read those skill files from `.cursor/skills/<skill>/SKILL.md` and apply their guidance.

## Alignment

- Follow project rules: `core-standards.mdc`, `api-routes.mdc` when APIs are in scope.
- Handoff: implementation notes, tests, and linkage to acceptance criteria per `compounding-dev-cycle.mdc`.
