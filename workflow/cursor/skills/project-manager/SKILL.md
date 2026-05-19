---
name: project-manager
description: Orchestrate the compounding development cycle (Plan → Code → Review/Test → Plan) with strict phase rules and automatic mode switching (ASK → PLAN → AGENT). Use when running project-manager command, delegating to implementation/review agents, or ensuring handoffs follow the rule’s Mode transition guide.
---

# Project Manager Skill

This skill enforces **token-policy** (`.cursor/rules/token-policy.mdc`: refine → hand off) and the **compounding development cycle** (`.cursor/rules/compounding-dev-cycle.mdc`) with strict phase discipline and **automatic mode switching** (ASK → PLAN → AGENT). When orchestrating the cycle, you MUST follow both rules’ **Mode switching** and **Mode transition guide** sections.

---

## Mode switching (from compounding-dev-cycle.mdc)

Switch modes explicitly as you progress. Each phase runs in a specific mode; state the mode when handing off to agents or instructing the user.

| Phase                  | Mode                    | Purpose                                                                                                                                   |
| ---------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **1a. Plan discovery** | **ASK**                 | Clarifying questions; gather requirements; structured requirements or RFC. Exit when scope and AC are unambiguous.                        |
| **1b. Plan authoring** | **PLAN**                | Write scope, AC, technical approach, task list. Output: single plan doc. Exit when another agent can implement without guessing.          |
| **2. Code**            | **AGENT**               | Full implementation. Subagents may edit, run commands, create files.                                                                      |
| **3. Review/Test**     | **AGENT** (review-only) | Reviewers produce rework list and summary; do not apply changes unless explicitly asked. Use **Ask mode** in Cursor for read-only review. |
| **4. Plan (rework)**   | **PLAN**                | Rework plan only; no implementation. Then AGENT (Code) → AGENT (Review) again.                                                            |

**Handoff rule:** When you delegate a phase, tell the recipient which mode to use (ASK / PLAN / AGENT). Example: "Run this task in **Agent mode**" or "Perform this review in **Ask mode** and produce a rework list; do not apply changes." Follow the rule’s **Mode transition guide** (Initial cycle and Rework cycle) for step order.

---

## Phase 1: Plan (ASK then PLAN)

**Goal:** Unambiguous scope, acceptance criteria, and technical approach before any implementation.

**Mode:** **ASK** when scope is unclear (discovery); then **PLAN** (authoring). No code changes, no file writes beyond the plan artifact.

**Inputs:** User request, existing codebase, constraints (deadlines, stack, standards).

**Outputs (handoff to Code):**

- **Scope:** In/out; dependencies and boundaries.
- **Acceptance criteria:** Testable conditions (Given/When/Then or checklist).
- **Technical approach:** Key components, APIs, data shapes; references to rules (e.g. `core-standards.mdc`, `api-routes.mdc`).
- **Task list:** Ordered implementation steps; optional file/area mapping.

**Artifact:** Single plan doc (e.g. `docs/plans/<feature>.md`). Use `feature-plan` to produce it; then hand to project-manager for Code → Review/Test.

**Agents (planning):** requirements-analyst, tech-stack-researcher, backend-architect, frontend-architect (design only). One agent owns the final plan.

**Gate:** Plan is complete when another agent can implement without guessing scope or acceptance. Only then hand off to **Code** and switch to **AGENT** mode.

---

## Phase 2: Code (AGENT)

**Goal:** Implement exactly to the plan; preserve handoff for Review/Test.

**Mode:** **AGENT.** Subagents may create/modify files, run commands, install dependencies.

**Inputs:** Plan artifact, project rules (core-standards, api-routes, typescript, react, e2e-tests), existing code.

**Outputs (handoff to Review/Test):**

- **Implementation:** Code that satisfies acceptance criteria and project standards.
- **Tests:** Unit/integration/API tests for new behavior; api-test / E2E patterns where relevant.
- **Implementation notes** (use this template):
  - **Done:** What was implemented (map to AC, e.g. AC-1, AC-2).
  - **Deferred:** What was postponed and why.
  - **Assumptions:** Environment, dependencies, behavior.
  - **Env/config:** Required env vars, config changes, setup steps.

**Discipline:** Do not expand scope. If the plan is wrong, note it and either adjust the plan doc or hand back to **Plan mode** for revision—do not implement beyond scope.

**Agents (Code):** backend-architect, frontend-architect, database-expert, or general implementation. Match agent to changed areas. Spawn order: database-expert (if DB work) → backend-architect → frontend-architect → e2e-runner.

**Handoff rule:** Review/Test must receive a clear diff, the plan’s acceptance criteria, and implementation notes. After Code completes, hand off to **Review/Test** and specify **Ask mode** (read-only) for reviewers.

---

## Phase 3: Review/Test (AGENT, review-only)

**Goal:** Verify behavior, standards, and security; produce pass/fail and rework list.

**Mode:** **AGENT** (review-only): rework list, summary, test status. Use Cursor **Ask mode** so reviewers do not apply changes. **Agent mode** only when applying rework in a later Code iteration.

**Inputs:** Plan (acceptance criteria), code diff, implementation notes, test results.

**Outputs (handoff to Plan or Code):**

- **Review summary:** Alignment with plan; adherence to core-standards, api-routes; security/performance notes.
- **Test status:** Which AC are covered; failing or missing tests.
- **Rework list:** Concrete items (file/line or component + required change + **severity**). Severity: **Critical** (must fix before production), **Suggestion**, **Nice to have**.

**Gates:** All acceptance criteria covered by tests; no project-rule violations; no unresolved high-severity security or data-integrity issues. **Production ready** only when all three gates pass and there are no Critical rework items.

**Agents (Review):** backend-reviewer, frontend-reviewer (auto-triggered after Code); optionally security-engineer, performance-engineer when in scope. E2E testing is user-triggered only.

**Handoff rule:** If **Critical** rework or gates not passed → hand back to **PLAN** (rework = new AC), then AGENT (Code), then Review/Test again. If only Suggestion/Nice to have → declare production ready; optionally offer to hand to Code with the rework list and re-run Review/Test.

---

## Phase 4: Plan (next iteration) — PLAN (brief)

**Goal:** Treat rework or new scope as a new cycle; nothing dropped.

**Mode:** **PLAN** (brief). Rework plan only; no implementation.

**Inputs:** Rework list from Review/Test (especially Critical items), or new user request.

**Process:** Turn rework into a short plan: scope = fixing issues, acceptance criteria = each critical item resolved, tasks for Code. **Write the rework plan to `docs/plans/<feature>-rework-N.md`** when N ≥ 1 (required for traceability). If the file cannot be written, keep in context and inform the user. Then **Code** (AGENT) → **Review/Test** (AGENT, Ask mode for review) again. Loop until no Critical issues and gates pass → declare **production ready**.

**Artifact:** Write rework plan to `docs/plans/<feature>-rework-N.md` when N ≥ 1 for traceability. If the file cannot be written, keep in context and inform the user.

---

## Cross-phase standards (strict)

- **Consistency:** All phases respect `core-standards.mdc` and domain rules (`api-routes.mdc`, etc.).
- **Traceability:** Link code and review to the plan (e.g. "implements AC-1, AC-2" in implementation notes or PR).
- **Single source of truth:** The plan doc is the contract; change it when scope or criteria change, then proceed.
- **Smooth handoff:** Each phase ends with **written artifacts**; no verbal-only handoffs.
- **Mode enforcement:** Always state ASK / PLAN / AGENT when delegating; follow the rule’s **Mode transition guide** for Initial and Rework cycles.

---

## When to use this skill

- Running the **project-manager** command with a feature plan.
- Delegating tasks to backend-architect, frontend-architect, e2e-runner, backend-reviewer, frontend-reviewer.
- Ensuring the cycle follows Plan → Code → Review/Test → Plan with correct Cursor modes.
- Creating rework plans after review and looping until production ready.

---

## Summary: mode per phase (align with Mode transition guide in rule)

1. **1a Discovery** → **ASK** (until scope and AC are clear).
2. **1b Plan authoring** → **PLAN** (single plan doc; exit when implementable without guessing).
3. **2. Code** → **AGENT** (implementation).
4. **3. Review/Test** → **AGENT** with **Ask mode** for review output (rework list; do not apply).
5. **4. Rework** → **PLAN** (brief), then repeat from step 3 until no Critical issues → production ready.

Do not suggest manual handoff without specifying the required mode (ASK / PLAN / AGENT) for the next phase.
