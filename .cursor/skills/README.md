# Project Skills

Skills in `.cursor/skills/` extend agent capabilities with reusable workflows and checklists. They are applied automatically when the agent detects relevant context.

## Skills by Agent

| Skill | Agent(s) | Purpose |
|-------|----------|---------|
| `api-design-patterns` | backend-architect | REST conventions, error handling, validation |
| `postgresql` | backend-architect, database-expert | Schema design, indexing, pgvector, RAG, query optimization |
| `nosql-databases` | backend-architect, database-expert | MongoDB, Convex, document stores—indexing, query optimization, schema design |
| `api-testing` | backend-architect, api-test | API test structure, assertions, coverage |
| `accessibility-checklist` | frontend-architect | WCAG 2.1 AA compliance checks |
| `e2e-playwright` | e2e-runner | Playwright patterns, POM, selectors |
| `security-audit` | security-engineer | OWASP Top 10 checklist |
| `refactoring-checklist` | refactoring-expert | Safe refactoring steps |
| `requirements-discovery` | requirements-analyst | User stories, PRD structure |
| `docs-structure` | technical-writer | README, API docs, guides |
| `performance-profiling` | performance-engineer | Measure-first optimization |
| `code-review` | All | PR review checklist |
| `feature-planning` | feature-plan | Task blocks for subagent hand-off |

## Usage

Skills are discovered automatically. Mention the task (e.g., "review this API for security") and the agent will apply the relevant skill. You can also explicitly reference: "Use the accessibility-checklist skill when reviewing this component."
