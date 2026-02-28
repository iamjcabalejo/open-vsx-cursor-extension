---
name: feature-planning
description: Break features into implementation tasks for backend, frontend, and E2E subagents. Use when planning features, creating implementation plans, or running feature-plan command.
---

# Feature Planning

## Required sections (for project-manager)

Plans produced by **feature-plan** should include these sections so **project-manager** can load and delegate reliably:

- **Scope / Metadata** (optional): `Security: critical`, `Performance: critical` when applicable
- **Feature Overview**: Problem, audience, key functionality
- **Technical Design**: Components, endpoints, schema, data flow
- **Backend Tasks**: For backend-architect (and database-expert when DB-heavy)
- **Frontend Tasks**: For frontend-architect
- **Integration & Testing**: For e2e-runner
- **File Changes**: New and modified files

## Task Blocks for Hand-off
- **Backend Tasks**: Setup → Database → API → Security
- **Frontend Tasks**: Components → Pages → Integration → Polish
- **Integration & Testing**: E2E flows, critical path coverage

## Per-Block Checklist
- [ ] Dependencies and env vars listed
- [ ] File changes (new/modified) specified
- [ ] API contract or schema described
- [ ] Success criteria clear

## Hand-off Order
1. backend-architect (API contract first)
2. frontend-architect (depends on API)
3. e2e-runner (validates full stack)

## Hand-off (via project-manager)
- **feature-plan** produces the plan file only; it does not spawn subagents.
- **project-manager** consumes the plan and spawns backend-architect, frontend-architect, e2e-runner in order (foreground, full context).

## Context to Pass
- Feature overview
- Technical design (components, endpoints, schema)
- File changes
- Dependencies
- API contract (for frontend)
- User flows (for E2E)
