---
description: Analyze task complexity and create actionable implementation plan
model: claude-sonnet-4-5
---

## Cursor mode: Plan mode only (strict)

Run this command in **Plan mode** only. This command is planning-only: do not implement code, do not run build/test commands, and do not modify application files. If the user asks to implement, direct them to run **feature-plan** (for a plan file) and then **project-manager** (for Code → Review/Test).

**Scope of this command:** This command produces a **task breakdown and implementation plan** only. It does **not** write to `docs/plans/` and does **not** run the full Plan → Code → Review cycle. For the full compounding cycle (plan file → delegation → code review → loop until production ready), use **feature-plan** to create a plan at `docs/plans/<feature-slug>.md`, then run **project-manager** with that plan path.

Analyze the following task and create a clear, actionable implementation plan.

## Clarification-first planning (interactive)

If the task description is incomplete or ambiguous, ask relevant follow-up questions before producing the final plan. Prioritize questions about goals, scope boundaries, target users, constraints, integrations, dependencies, edge cases, and acceptance criteria. Do not assume missing requirements without stating them.

## Task

$ARGUMENTS

## Agent Definitions

**Apply the agent-selection skill** (`.cursor/skills/agent-selection/SKILL.md`): before analyzing the task, identify relevant agents, read their definitions from `.cursor/agents/`, and apply their perspective to the analysis and implementation plan.

**Relevant agents for this command** (task breakdown): backend-architect, frontend-architect, system-architect, security-engineer, performance-engineer, tech-stack-researcher, learning-guide, technical-writer, requirements-analyst, refactoring-expert. Use the subset that matches the task.

## Analysis Framework

### 1. **Task Breakdown**
- Understand requirements
- Identify dependencies
- List affected files/components
- Estimate complexity (Small/Medium/Large)

### 2. **Time Estimation**
- **Small**: 1-2 hours (simple bug fix, minor feature)
- **Medium**: Half day to 1 day (new component, API endpoint)
- **Large**: 2-5 days (complex feature, multiple integrations)
- **Very Large**: 1+ week (major refactor, new subsystem)

### 3. **Risk Assessment**
Identify potential blockers:
- Unknown dependencies
- API limitations
- Data migration needs
- Breaking changes
- Third-party service issues

### 4. **Implementation Steps**

Create sequential, logical steps:
1. Setup/preparation
2. Backend changes
3. Frontend changes
4. Testing
5. Documentation
6. Deployment

### 5. **Success Criteria**

Define "done":
- Feature works as specified
- Tests pass
- No regressions
- Code reviewed
- Documented

## Output Format

### Task Analysis
- **Type**: [Bug Fix / Feature / Refactor / Infrastructure]
- **Complexity**: [Small / Medium / Large / Very Large]
- **Estimated Time**: X hours/days
- **Priority**: [High / Medium / Low]

### Implementation Plan

**Phase 1: [Name]** (Time estimate)
- [ ] Step 1
- [ ] Step 2

**Phase 2: [Name]** (Time estimate)
- [ ] Step 3
- [ ] Step 4

### Files to Modify/Create
```
app/page.tsx (modify)
components/NewComponent.tsx (create)
lib/utils.ts (modify)
```

### Dependencies
```bash
npm install package-name
```

### Testing Strategy
- Unit tests for X
- Integration tests for Y
- Manual testing steps

### Potential Issues
- Issue 1 and mitigation
- Issue 2 and mitigation

### Next Steps
1. Start with Phase 1, Step 1
2. Test incrementally
3. Commit often

Provide a clear, solo-developer-friendly plan that breaks down complex tasks into manageable steps.
