---
name: feature-planning
description: Break features into implementation tasks for backend, frontend, and E2E subagents. Use when planning features, creating implementation plans, or running feature-plan command. Plan mode only—no implementation.
---

# Feature Planning

## Cursor mode: Plan mode only (strict)

When this skill is used (including by the **feature-plan** command), work MUST be done in **Plan mode**. No implementation: no application code, no file creation except the plan artifact at `docs/plans/<feature-slug>.md`. Planning agents may inform scope and tasks; they are not spawned for Code or Review. If asked to implement, decline and direct to run **project-manager** with the plan.

## Token-efficient response policy (always on)

Apply token-efficient mode when producing plan content.

- **Default intensity:** `full` (`lite`/`ultra` optional when explicitly requested).
- **Rule:** concise but complete; do not omit required plan sections, AC numbering, or file-path specificity.
- **Auto-clarity override:** use explicit full-language wording for destructive/security-sensitive/irreversible guidance and ambiguity-prone multi-step instructions.
- **No ambiguous compression:** keep scope boundaries, risks, mitigations, and pass/fail criteria explicit.

## Clarification-first behavior (required)

Planning must be interactive when details are missing. Before finalizing the plan, ask relevant clarifying questions about:
- business objective and success outcome
- in-scope vs out-of-scope boundaries
- user roles and primary flows
- constraints, integrations, dependencies, and environments
- edge cases and non-functional requirements (security, performance)
- acceptance criteria and definition of done

Do not infer critical requirements silently. If the user asks to proceed without all answers, explicitly document assumptions in the plan.

## Rules to follow

- **Compounding cycle:** Follow the **Plan** phase in `AGENTS.md compounding-dev-cycle.mdc`: goal = unambiguous scope, acceptance criteria, technical approach; artifact = single plan doc; handoff rule = plan complete when another agent can implement without guessing.
- **Project-manager handoff:** Align with `~/.codex/skills/project-manager/SKILL.md`: Plan phase uses Plan mode; plan output feeds project-manager for Code (Agent mode) and Review/Test (Ask mode).

## Required sections (for project-manager)

Plans produced by **feature-plan** must include these sections so **project-manager** can load and delegate reliably:

- **Scope / Metadata** (optional): `Security: critical`, `Performance: critical` when applicable
- **Feature Overview**: Problem, audience, key functionality
- **Acceptance criteria**: Testable conditions, numbered (AC-1, AC-2, …) for traceability
- **Technical Design**: Components, endpoints, schema, data flow
- **Backend Tasks**: For backend-architect (and database-expert when DB-heavy)
- **Frontend Tasks**: For frontend-architect
- **Integration & Testing**: For e2e-runner
- **File Changes**: New and modified files
- **Dependencies / env**: Packages, env vars, config changes

## Task Blocks for Hand-off
- **Backend Tasks**: Setup → Database → API → Security
- **Frontend Tasks**: Components → Pages → Integration → Polish
- **Integration & Testing**: E2E flows, critical path coverage

## Per-Block Checklist
- [ ] Dependencies and env vars listed
- [ ] File changes (new/modified) specified
- [ ] API contract or schema described
- [ ] Success criteria clear
- [ ] RiskControls map critical risks to control + validation + pass condition

## Detail level (for project-manager handoff)

Plans must be **detailed** so implementers do not guess. Include:
- **Task analysis**: Type, complexity, estimated effort, priority
- **Acceptance criteria**: Numbered (AC-1, AC-2, …), testable (Given/When/Then or pass/fail)
- **Technical design**: Named components, per-endpoint (method, path, request/response shape), data model, data flow
- **Backend / Frontend tasks**: Phased steps with checkboxes; concrete file paths (create/modify) per phase; API contract summary for frontend
- **Integration & testing**: Named E2E flows with steps; critical paths; unit/integration areas
- **File changes**: Explicit list (path + create or modify)
- **Dependencies / env**: Package names and purpose; env var name, purpose, example, required vs optional
- **Risks / potential issues** (recommended): 2–5 bullets with mitigations or TBD
- **Next steps**: Run project-manager with plan path

See `AGENTS.md commands/misc/feature-plan.md` section "Detailed output format (mandatory)" for the full template.

## Hand-off Order
1. backend-architect (API contract first)
2. frontend-architect (depends on API)
3. e2e-runner (validates full stack)

## Hand-off (via project-manager)

- **feature-plan** produces the plan file only; it does not spawn subagents. It always runs in **Plan mode**.
- **project-manager** consumes the plan and runs Code (Agent mode) then Review/Test (Ask mode), per `~/.codex/skills/project-manager/SKILL.md`.

## Plan-mode checklist (before considering the plan done)

- [ ] All required sections above are present (Scope/Metadata, Feature Overview, Acceptance criteria, Technical design, Backend tasks, Frontend tasks, Integration & Testing, File changes, Dependencies/env).
- [ ] Acceptance criteria are testable and numbered (AC-1, AC-2, …) for traceability.
- [ ] No application code or implementation was written; only the plan document was produced.
- [ ] Plan path is `docs/plans/<feature-slug>.md`. User is directed to run project-manager with that path for the next step.

## Context to Pass
- Feature overview
- Technical design (components, endpoints, schema)
- File changes
- Dependencies
- API contract (for frontend)
- User flows (for E2E)
