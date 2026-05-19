# Project Rules

Rules in `.cursor/rules/` provide persistent AI guidance. They are `.mdc` files with YAML frontmatter.

## Rules

| Rule                    | Scope            | Covers                                                                           |
| ----------------------- | ---------------- | -------------------------------------------------------------------------------- |
| `token-policy`          | Always           | Refine → hand off, concise sessions, lean diffs, XML blueprints for complex work |
| `compounding-dev-cycle` | Always           | Plan → Code → Review/Test → Plan with handoffs between agents                    |
| `core-standards`        | Always           | Type safety, error handling, naming, function design                             |
| `typescript`            | `**/*.ts`        | Types, declarations, imports, type guards                                        |
| `react`                 | `**/*.tsx`       | Components, accessibility, state, performance                                    |
| `api-routes`            | `**/api/**/*.ts` | Validation, status codes, error shape, security                                  |
| `e2e-tests`             | `**/*.spec.ts`   | Selectors, waiting, isolation, Page Object Model                                 |

## Adding Rules

Create `.mdc` files with frontmatter:

```yaml
---
description: What this rule does
globs: "**/*.ts" # Optional - file pattern
alwaysApply: false # Optional - true for every session
---
```
