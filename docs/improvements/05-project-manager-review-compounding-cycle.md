# Project Manager Review: Alignment with Compounding Dev Cycle

**Date:** 2025-03-03  
**Scope:** How the project-manager command and skill implement the compounding development cycle (`.cursor/rules/compounding-dev-cycle.mdc`). What to update or fix.

---

## 1. Executive Summary

The project-manager is **well aligned** with the compounding dev cycle philosophy. It correctly implements **Code → Review/Test → Plan (rework) → Code → …** with strict phase discipline, Cursor mode enforcement (Plan / Agent / Ask), conditional agents (database-expert, security-engineer, performance-engineer), and a rework loop until production ready. A few gaps and improvements would make it more robust and easier to use.

**Verdict:** Implements the cycle correctly for current philosophy. Recommended updates are below (§4).

---

## 2. Alignment with the Rule

### 2.1 Phase mapping

| Rule phase | project-manager implementation | Match |
|------------|---------------------------------|--------|
| **1. Plan** | Not run by project-manager; user runs **feature-plan** first. project-manager receives the plan path as input. | ✅ By design (documented: feature-plan → project-manager). |
| **2. Code** | Phase A: A0 (database-expert if DB tasks) → A1 (backend-architect) → A2 (frontend-architect) → A3 (e2e-runner). Order and conditionals match rule. | ✅ |
| **3. Review/Test** | Phase B: B1 (backend-reviewer), B2 (frontend-reviewer), B3 (security-engineer), B4 (performance-engineer) when plan marks scope. E2E not auto-triggered. | ✅ |
| **4. Plan (next)** | Phase C: On Critical rework or failed gates → rework plan (prefer `docs/plans/<feature>-rework-N.md`) → Code again → Review again. Loop until no Critical and gates pass. | ✅ |

### 2.2 Handoff artifacts

- **Code → Review/Test:** Command requires implementation notes (done/deferred/assumptions/env), test status, and clear diff/AC. Matches rule §2.
- **Review/Test → Plan or Code:** Review summary, rework list with severity (Critical / Suggestion / Nice to have), test status. Matches rule §3.
- **Single source of truth:** Plan doc is the contract; traceability to AC (e.g. “implements AC-1”) is required in implementation notes and review. Matches cross-phase standards.

### 2.3 Gates and production ready

- Rule §3: Production ready when gates pass and no Critical rework items. Gates: AC covered by tests, no project-rule violations, no unresolved high-severity security or data-integrity issues.
- project-manager Phase C: “When there are no Critical issues and gates pass” → declare production ready. Skill and command reference “gates (rule §3).”
- **Gap:** The command does not spell out the full gate checklist in Phase C. The skill does. Recommendation: add a one-line gate checklist in the command’s Phase C so the model explicitly checks all three.

### 2.4 Cursor mode enforcement

- **Plan:** feature-plan runs in Plan mode; project-manager uses Plan mode for rework plans (Phase C).
- **Code:** Phase A instructs “Spawn all Code-phase agents in **Agent mode**.”
- **Review/Test:** Phase B instructs “Spawn reviewers in **Ask mode**” and “do not apply changes unless explicitly asked.”
- Mode is stated when delegating. Aligned with project-manager skill and README (Plan / Agent / Ask).

---

## 3. Gaps and Inconsistencies

### 3.1 Suggestion/Nice to have rework (rule vs command)

- **Rule §3:** “If only trivial/suggestion rework, hand to **Code** with the rework list and re-run Review/Test.”
- **Skill:** “If only Suggestion/Nice to have → optional hand to Code with rework list and re-run Review/Test.”
- **Command Phase C:** Only describes the Critical path (loop until no Critical and gates pass). It does not say what to do when there are **only** Suggestion/Nice to have items (e.g. offer optional Code pass).

**Recommendation:** In Phase C, add: “When there are no Critical issues and gates pass but the rework list has Suggestion or Nice to have items: declare production ready; optionally offer to run Code with the rework list and re-run Review/Test.”

### 3.2 Explicit gate checklist in Phase C

- Rule and skill define gates; command says “Check gates (rule §3)” and “gates not passed” but does not list them in Phase C.
- **Risk:** The model might not consistently verify all three (AC covered by tests, no rule violations, no high-severity security/data-integrity issues).

**Recommendation:** In Phase C, add a short gate checklist: “Gates: (1) All acceptance criteria covered by tests, (2) No known violations of project rules, (3) No unresolved high-severity security or data-integrity issues.”

### 3.3 Plan file validation

- project-manager “Load the plan” and accepts a path; if path does not exist, it asks the user.
- It does **not** validate that the plan has required sections (e.g. Acceptance criteria, Backend Tasks, Frontend Tasks) per feature-planning skill and feature-plan.

**Risk:** A minimal or malformed plan could be passed to subagents, leading to incomplete context.

**Recommendation:** Add a validation step after loading the plan: “If the plan is missing required sections (Scope/Metadata, Feature Overview, Acceptance criteria, Technical design, Backend tasks, Frontend tasks, Integration & Testing, File changes, Dependencies/env), ask the user to run feature-plan to produce a complete plan or to supply the missing sections before proceeding.”

### 3.4 Rework plan artifact (prefer vs require)

- Phase C: “**Prefer** writing the rework plan to `docs/plans/<feature>-rework-N.md` when N ≥ 1.”
- Earlier architectural review recommended making this **required** for traceability.

**Recommendation:** Strengthen to “**Write** the rework plan to `docs/plans/<feature>-rework-N.md` when N ≥ 1 (required for traceability and audit). If the file cannot be written, note the rework plan in context and inform the user.”

### 3.5 Aggregation format for handoffs

- Command asks to “aggregate” Code → Review/Test handoff and review summaries/rework lists. No structured schema or template is given.
- **Risk:** With long rework lists or many agents, natural-language aggregation may drop or blur items.

**Recommendation:** Add a minimal structure for aggregated handoffs, e.g. required headings: “## Code phase summary”, “## Implementation notes (by agent)”, “## Review summaries”, “## Rework list (by severity)”. Optionally add the same for “Production ready” summary.

### 3.6 How “spawn” is implemented

- Command and skill say “spawn” subagents (backend-architect, frontend-reviewer, etc.). The extension does not contain code that invokes Cursor’s subagent/task API (e.g. `mcp_task`); commands are markdown consumed by the model.
- So “spawning” is **instruction-driven**: the project-manager model is told to spawn agents and pass context. Whether that results in actual subagent calls depends on Cursor’s UI/API.

**Recommendation:** If Cursor supports a concrete mechanism (e.g. `mcp_task` with subagent_type), add one short note in the command or DEV-GUIDE: “To spawn subagents, use [X] with the following agent types and prompt.” Otherwise, keep current wording but in DEV-GUIDE document that delegation is instruction-based and the user may need to run agents manually if the environment does not support subagent calls.

### 3.7 docs/plans directory

- No `docs/plans/` directory was present in the repo. feature-plan writes to `docs/plans/<feature-slug>.md`; project-manager expects a plan path.
- **Recommendation:** Either ensure the “Apply workflow” or feature-plan flow creates `docs/plans/` when missing, or document in feature-plan/project-manager that the first run of feature-plan will create it. Low priority.

---

## 4. Recommended Updates (Prioritized)

| Priority | Item | Action |
|----------|------|--------|
| **P1** | Suggestion/Nice to have rework | In project-manager command Phase C, add one sentence: when only Suggestion/Nice to have items exist, declare production ready and optionally offer Code + re-run Review/Test. |
| **P1** | Gate checklist in Phase C | In project-manager command Phase C, add the three gates explicitly (AC covered by tests, no rule violations, no high-severity security/data-integrity issues). |
| **P2** | Plan file validation | In project-manager command “Load the plan”, add a step: if required sections are missing, ask user to run feature-plan or supply sections before proceeding. |
| **P2** | Rework plan artifact | In project-manager command Phase C, change “Prefer writing” to “Write … (required for traceability)” with fallback if file cannot be written. |
| **P2** | Aggregation structure | In project-manager command, add minimal required headings for Code handoff and for final “production ready” summary. |
| **P3** | Spawn mechanism | In DEV-GUIDE (or command), document how delegation/spawning is intended to work (instruction-based vs Cursor subagent API) and any user fallback. |
| **P3** | docs/plans | Ensure or document creation of `docs/plans/` when applying workflow or running feature-plan. |

---

## 5. What Is Already Working Well

- **Phase order and conditionals:** A0→A1→A2→A3 and B1–B4 with Security/Performance in scope are correct and match the rule.
- **E2E not auto-triggered** in Review is explicit and matches the rule.
- **feature-plan → project-manager** handoff is clear; feature-plan states Plan mode only and points to project-manager for the cycle.
- **Agent definitions** exist for all spawned agents; command references the right agent files and skills.
- **Rework loop** (rework plan → Code → Review until no Critical) is clearly specified.
- **Mode enforcement** (Plan / Agent / Ask) is explicit in both skill and command.
- **Traceability** (link to AC, implementation notes template, rework list with severity) is required and consistent with the rule.
- **Cross-phase standards** (single source of truth, written artifacts, consistency with core-standards) are reflected in the command and skill.

---

## 6. Conclusion

The project-manager **implements the compounding dev cycle** as intended: Code → Review/Test → Plan (rework) → Code → … with correct agents, modes, and gates. The main improvements are: (1) handle Suggestion/Nice to have rework explicitly in Phase C, (2) make gates explicit in Phase C, (3) validate plan structure before running Code, (4) require rework plan file when N ≥ 1, and (5) add minimal structure for aggregated handoffs. Implementing the P1 and P2 items will make the workflow more robust and easier to follow for both the model and the user.
