# Static Architectural Review: Custom AI System

**Scope:** Workflows, agents, skills, commands, rules  
**Focus:** Compounding development cycle, production readiness, hand-off quality  
**Method:** Static analysis only (no execution, no file changes)

---

## Executive Summary

The system is **well aligned** with a Plan → Code → Review/Test → Plan cycle: a single rule (`compounding-dev-cycle.mdc`) defines phases, artifacts, and gates; `feature-plan` and `project-manager` implement a clear two-step workflow; and core Code/Review agents (backend-architect, frontend-architect, backend-reviewer, frontend-reviewer, e2e-runner) have consistent handoff sections. **Strengths:** strong phase contracts, explicit rework severities, traceability to acceptance criteria, and good skill–agent mapping. **Critical gaps:** the cycle rule is not listed in the plugin manifest; `database-expert` is not in project-manager’s numbered Phase A; optional reviewers (security-engineer, performance-engineer) are never spawned; and two planning paths (`feature-plan` vs `new-task`) risk confusion and plans that don’t feed the cycle. **Production readiness** is supported by backend/frontend reviewer checklists and api-routes/core-standards, but E2E is user-triggered only and some UI/standalone commands lack an explicit handoff so their output may not be “review-ready” by default.

---

## Strengths

1. **Single source of truth for the cycle**  
   `compounding-dev-cycle.mdc` clearly defines Plan, Code, Review/Test, and next-iteration Plan with inputs, outputs, and handoff rules. Plan doc as contract and “no guessing” for the next phase are explicit.

2. **Clear workflow split**  
   `feature-plan` only writes the plan file; `project-manager` runs Code → Review and the rework loop. No single “do everything” prompt; scope is preserved and review is guaranteed.

3. **Structured rework and gates**  
   Review outputs use **Critical** / **Suggestion** / **Nice to have** and require concrete file/line + change + reason. Gates (AC covered, no rule violations, no high-severity security/data issues) are defined and tied to “production ready.”

4. **Agent–phase alignment**  
   Code-phase agents (backend-architect, frontend-architect, e2e-runner, database-expert) and Review-phase agents (backend-reviewer, frontend-reviewer) each have a “Compounding dev cycle” section and “When Invoked / When Given Implementation Tasks” that match the rule’s inputs/outputs.

5. **Skill modularity**  
   Skills are scoped by domain (api-testing, e2e-playwright, security-audit, feature-planning, code-review, etc.) and referenced from agent definitions and commands. Overlap is limited (e.g. code-review used by both reviewers).

6. **API and backend discipline**  
   `api-new`, `api-test`, and `api-protect` reference the cycle and backend-reviewer’s checklist; api-routes.mdc and api-design-patterns/api-testing skills give a consistent contract for production-ready APIs.

7. **Hooks**  
   Hooks (e.g. afterFileEdit format, sessionStart context, beforeShellExecution audit) are documented and separate from the AI workflow, reducing coupling.

---

## Critical Issues / Risks

1. **`compounding-dev-cycle` missing from plugin manifest**  
   `.cursor-plugin/plugin.json` lists only five rules (core-standards, typescript, react, api-routes, e2e-tests). `compounding-dev-cycle.mdc` has `alwaysApply: true` in `.cursor/rules/` but is **not** in the plugin’s `rules` array. In environments where rules are driven by the plugin, the cycle may not be applied consistently. **Risk:** Handoff behavior and phase discipline depend on a rule that plugin users might not get.

2. **`database-expert` not in project-manager Phase A**  
   The rule and “Hand-off rules” say: “Database-heavy: Spawn database-expert with DB sections before or with backend-architect.” Phase A only lists A1 backend-architect, A2 frontend-architect, A3 e2e-runner. There is no A0 or A1b for database-expert. **Risk:** DB-heavy plans may never get database-expert; schema/query work may be done only by backend-architect without DBA-focused review.

3. **Optional reviewers never triggered**  
   The rule (§3 Review/Test) says: “optionally security-engineer, performance-engineer when in scope.” `project-manager` Phase B only spawns backend-reviewer and frontend-reviewer. There is no conditional spawn of security-engineer or performance-engineer. **Risk:** Security- or performance-critical acceptance criteria are only checked via backend/frontend reviewers’ checklists; no dedicated security or performance review pass.

4. **Two planning paths that don’t connect**  
   - `feature-plan`: writes `docs/plans/<feature-slug>.md`, explicitly for use with `project-manager`.  
   - `new-task`: produces an “implementation plan” (phases, steps, files) but does **not** write to `docs/plans/` and does **not** reference feature-plan or project-manager.  
   **Risk:** Users may use `new-task` expecting the same cycle; the resulting plan is not in the canonical location and project-manager is not instructed to use it, so the loop (Code → Review → rework) may be bypassed or duplicated.

5. **Command/README vs implementation mismatch**  
   - `plugin.json`: new-task description is “Analyze code for performance issues and suggest optimizations.”  
   - `new-task.md`: “Analyze task complexity and create actionable implementation plan.”  
   - README: “/new-task - Analyze code for performance issues.”  
   **Risk:** Users invoke new-task for performance analysis and get task breakdown instead, or the other way around; trust in the plugin and correct command choice suffer.

---

## Dev Cycle & Compounding Efficiency Analysis

- **Iteration quality**  
  Implementation notes, “implements AC-X,” and reviewer rework lists with severity support iterative fixes without losing context. The rule’s “rework = new AC” keeps the plan as the contract across loops.

- **Hand-off smoothness**  
  Code phase agents are instructed to return: implementation, tests, implementation notes, and link to AC. Review phase agents return: review summary, rework list (with severity), test status. project-manager aggregates these and decides loop vs production ready. One gap: **aggregation format** (e.g. a single structured handoff blob) is not specified; project-manager relies on natural-language aggregation, which may drop or blur items when rework lists are long.

- **E2E in the cycle**  
  E2E is intentionally user-triggered. e2e-runner is spawned in Phase A for “implement E2E tests”; it does not run the suite in Phase B. So “test status” in Review is unit/integration only. For production readiness, E2E is a manual step. This is documented but is a deliberate gap in automation.

- **Scope creep control**  
  Multiple agents and commands say “do not expand scope without updating the plan first” and “if the plan is wrong, note it and hand back to Plan.” That supports compounding by limiting drift; the main risk is standalone commands (e.g. component-new, page-new) that don’t require a plan and can produce out-of-scope work if used in the middle of a planned feature.

---

## Production-Readiness Gaps

1. **E2E not in the gate**  
   “Production ready” is defined when code-review gates pass and there are no Critical rework items. E2E runs are not a formal gate; the rule and project-manager say the user runs E2E when they want. For strict production readiness, E2E could be an optional gate (e.g. “when E2E exists for this feature, it must pass”) or remain as-is but documented as a known gap.

2. **UI commands and handoff**  
   `component-new` and `page-new` do not reference compounding-dev-cycle or implementation notes / backend-reviewer handoff. They do reference frontend-architect and other agents. So output can be high quality but not explicitly “handoff-ready” (implementation notes, AC mapping). Contrast: `api-new` and `api-test` explicitly reference the cycle and backend-reviewer.

3. **No explicit “implementation notes” template**  
   The rule and agents say “implementation notes (what was done, deferred, assumptions, env/config)” but there is no standard template or checklist. Minor risk of inconsistent or incomplete notes and harder review.

4. **Security and performance**  
   backend-reviewer and frontend-reviewer checklists include security and performance, but there is no automatic security-engineer or performance-engineer pass. For high-risk features, production readiness may depend on manual invocation of those agents.

---

## Architectural Weaknesses

1. **Plan format not enforced**  
   feature-plan specifies sections (e.g. Backend Tasks, Frontend Tasks, Integration & Testing, File Changes). project-manager “Load the plan” assumes that structure. There is no schema or validation; a malformed or minimal plan could cause project-manager to pass incomplete context to subagents.

2. **Order and parallelism**  
   Phase A is strictly sequential (backend → frontend → e2e). Frontend could theoretically start once the API contract is fixed, but the workflow does not define “API contract first” as a formal artifact (e.g. OpenAPI snippet) that frontend can consume in parallel. So frontend may wait on full backend implementation.

3. **Rework loop ownership**  
   When project-manager creates a “rework plan,” it says “optionally write `docs/plans/<feature>-rework-N.md` or keep in context.” If rework is only in context, the next iteration has no durable plan doc update; traceability and audit trail are weaker.

4. **Agent list vs. cycle**  
   Many agents (requirements-analyst, tech-stack-researcher, system-architect, architecture-strategist, pattern-recognition-specialist, etc.) participate in Plan or Review in the rule text but are **not** spawned by project-manager. They are “call when needed” by the user or by feature-plan. That’s flexible but can lead to underuse or inconsistency (e.g. when to use architecture-strategist vs backend-reviewer for structure).

---

## Redundancies / Inefficiencies

1. **Duplicate “read agent definitions” blocks**  
   feature-plan, project-manager, api-test, api-new, api-protect, code-optimize, component-new, new-task each have long “Agent Definitions / CRITICAL: Before X, load…” sections. The pattern is the same; only the list of relevant agents differs. This could be a shared skill or a single “agent-selection” reference to reduce duplication and drift.

2. **new-task vs feature-plan overlap**  
   Both produce a breakdown (steps, phases, files, estimates). new-task does not write to docs/plans or tie into project-manager. Unifying “lightweight plan” (new-task) with “canonical plan” (feature-plan) or making new-task output consumable by project-manager would reduce two parallel paths.

3. **code-review skill vs reviewer checklists**  
   backend-reviewer and frontend-reviewer each have a detailed checklist in their agent file and also “apply code-review skill.” The code-review skill is generic (correctness, security, maintainability, severity levels). Some duplication between skill and agent checklists; the skill could be the single checklist and agents reference it, or the skill could be shortened to “how to give feedback” and checklists stay in agents.

---

## Improvement Opportunities

1. **Plugin manifest**  
   Add `compounding-dev-cycle` to `.cursor-plugin/plugin.json` `rules` with path and description so the cycle is part of the plugin contract.

2. **project-manager Phase A and B**  
   - Add an explicit step for database-expert when the plan has DB-heavy tasks (e.g. “if plan specifies database tasks, spawn database-expert before or with backend-architect”).  
   - Add optional Phase B steps: “If plan marks security as in-scope, spawn security-engineer with plan + backend diff”; “If plan marks performance as in-scope, spawn performance-engineer.” Use plan metadata or tags (e.g. `security: critical`, `performance: critical`) to decide.

3. **Unify or clarify planning commands**  
   Either: (a) Make new-task write to `docs/plans/<task-slug>.md` and state “Run project-manager with this plan to execute the cycle,” or (b) Rename/repurpose new-task so it’s clearly “task breakdown only, not the cycle plan” and point to feature-plan for cycle plans. Fix plugin.json and README so new-task’s description matches its behavior.

4. **component-new / page-new and the cycle**  
   Add a short “Compounding dev cycle” block: “If this component/page is part of a feature with a plan doc, implement to that plan and produce implementation notes for Review/Test. If standalone, produce a short implementation notes (what was done, deferred, assumptions) so frontend-reviewer can verify.” Align with api-new.

5. **Implementation notes template**  
   In compounding-dev-cycle.mdc or a small skill, add a minimal template: e.g. “Done: … | Deferred: … | Assumptions: … | Env/config: …” so Code-phase agents and reviewers have a consistent shape.

6. **Rework plan persistence**  
   In project-manager Phase C, require (or strongly recommend) writing rework plans to `docs/plans/<feature>-rework-N.md` when N ≥ 1 so every loop has a durable plan update and traceability is clear.

7. **feature-plan and plan schema**  
   In feature-planning skill or feature-plan, add a “Required sections” checklist (Scope, AC, Backend Tasks, Frontend Tasks, Integration & Testing, File Changes) and instruct feature-plan to emit them so project-manager can rely on structure.

---

## Prioritized Recommendations

| Priority | Recommendation | Impact |
|----------|----------------|--------|
| **P0** | Add `compounding-dev-cycle` to plugin.json `rules` | Ensures the cycle is applied for all plugin users. |
| **P0** | Add database-expert to project-manager Phase A when plan has DB tasks | Prevents DB-heavy work from skipping DBA-focused implementation/review. |
| **P1** | Resolve new-task vs feature-plan: either make new-task output a plan file + project-manager input, or rename/describe new-task and document “for cycle use feature-plan” | Reduces confusion and ensures plans feed the cycle when intended. |
| **P1** | Fix plugin.json and README description of new-task to match its actual behavior (task analysis + implementation plan) | Restores correct user expectations and command choice. |
| **P2** | Add optional security-engineer and performance-engineer spawn in project-manager Phase B when plan indicates scope | Aligns with the rule and improves production readiness for security/performance-critical features. |
| **P2** | Add a short “Compounding dev cycle” handoff section to component-new and page-new | Makes UI command output consistently review-ready. |
| **P2** | Define a minimal implementation-notes template in the rule or a skill | Improves consistency and completeness of Code → Review handoff. |
| **P3** | Prefer writing rework plans to `docs/plans/<feature>-rework-N.md` in Phase C | Better traceability and audit trail across iterations. |
| **P3** | Extract “agent selection / read definitions” into a shared skill or reference | Reduces duplication and keeps agent lists consistent across commands. |
