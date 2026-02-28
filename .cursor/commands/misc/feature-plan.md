---
description: Produce a feature implementation plan only (no delegation); output as .md file
model: claude-sonnet-4-5
---

Create a detailed implementation plan for the following feature. This command produces **only the Plan** phase of the compounding dev cycle. It does **not** spawn or delegate to other agentsùuse the **project-manager** command for that. See `.cursor/rules/compounding-dev-cycle.mdc` and the feature-planning skill.

## Feature Description

$ARGUMENTS

## Output: plan file only

**This command must:**
1. Produce a complete implementation plan (see Output Format below).
2. **Write the plan to a file** at `docs/plans/<feature-slug>.md`. Use a short, URL-friendly slug derived from the feature name (e.g. `user-profile`, `password-reset`). Create the `docs/plans` directory if it does not exist.
3. **Stop after writing the file.** Do not spawn subagents or suggest running other commands in this step. The user runs **project-manager** separately to delegate from the plan.

**Handoff rule**: The plan is complete when project-manager (or Code agents) can implement without guessing scope or acceptance. The written plan doc is the single source of truth for project-manager and Review/Test.

## Compounding dev cycle (Plan phase only)

Produce handoff artifacts so **Code** (via project-manager) can implement without guessing and **Review/Test** can verify against clear acceptance criteria. Produce:

- **Scope**  What is in/out; dependencies and boundaries.
- **Acceptance criteria**  Testable conditions (Given/When/Then or checklist). Each AC should be verifiable by backend-reviewer, frontend-reviewer, or e2e-runner.
- **Technical approach**  Key components, APIs, data shapes; references to `core-standards.mdc`, `api-routes.mdc`, and other project rules.
- **Task list**  Ordered implementation steps; optional file/area mapping. Structure as Backend / Frontend / Integration & Testing so project-manager can delegate to backend-architect, frontend-architect, e2e-runner.

## Agent Definitions

**Apply the agent-selection skill** (`.cursor/skills/agent-selection/SKILL.md`): before planning, identify relevant agents, read their definitions from `.cursor/agents/`, and apply their perspective to the plan.

**Relevant agents for this command:** backend-architect, frontend-architect, system-architect, security-engineer, performance-engineer, tech-stack-researcher, learning-guide, technical-writer, requirements-analyst, refactoring-expert, e2e-runner. Use the subset that matches the feature.

## Planning Framework for Solo Developers

### 1. **Feature Breakdown**

Analyze and break down into:
- User stories
- Technical requirements
- Dependencies
- Edge cases
- Success criteria

### 2. **Technical Specification**

**Architecture**
- Where does this fit in the codebase?
- Which components/pages affected?
- New vs modified files
- Database schema changes
- API endpoints needed

**Technology Choices**
- Libraries/packages needed
- Why each choice?
- Alternatives considered
- Trade-offs

**Data Flow**
```
User Action ù Frontend ù API ù Database ù Response
User Action ? Frontend ? API ? Database ? Response
```

### 3. **Implementation Steps**

Break into logical,  sequential tasks:

1. **Setup** - Dependencies, configuration
2. **Database** - Schema, migrations, RLS policies
3. **Backend** - API routes, validation, logic
4. **Frontend** - Components, pages, forms
5. **Integration** - Connect pieces
6. **Testing** - Unit, integration, E2E
7. **Polish** - Error handling, loading states, UX

### 4. **Risk Assessment**

Identify potential issues:
- **Technical Risks** - Complexity, unknown territory
- **Time Risks** - Underestimated tasks
- **Dependency Risks** - External APIs, third-party services
- **Data Risks** - Migration, backward compatibility

### 5. **Estimation**

Realistic time estimates:
- Small task: 1-2 hours
- Medium task: Half day
- Large task: 1-2 days
- Complex task: 3-5 days

**Rule of thumb**: Double your initial estimate for solo development.

### 6. **Success Criteria**

Define "done":
-  Feature works as specified
-  Tests pass
-  No console errors
-  Accessible
-  Responsive
-  Error handling
-  Loading states
-  Documentation updated

## Output Format

### 0. **Scope / Metadata** (optional)

When the feature is security- or performance-critical, add so project-manager can spawn optional reviewers:

- **Security: critical** ù when the feature involves auth, sensitive data, or security-sensitive flows (triggers security-engineer in Review phase).
- **Performance: critical** ù when the feature has explicit performance or scalability acceptance criteria (triggers performance-engineer in Review phase).

### 1. **Feature Overview**
- What problem does this solve?
- Who is it for?
- Key functionality

### 2. **Technical Design**
```
User Action ? Frontend ? API ? Database ? Response
```
- Component structure
- API endpoints
- Database schema
- State management

### 3. **Implementation Plan**

Structure the plan with **clearly separated task blocks** for agent hand-off. Use these exact section headers so subagents can be spawned with the right context.

**Backend Tasks** (for `backend-architect` subagent)
- [ ] Setup: Dependencies, configuration, environment
- [ ] Database: Schema, migrations, RLS policies
- [ ] API: Routes, validation, business logic
- [ ] Security: Auth, authorization, input validation

**Frontend Tasks** (for `frontend-architect` subagent)
- [ ] Components: UI elements, forms, layouts
- [ ] Pages: Routes, data fetching, state
- [ ] Integration: Connect to API, error handling
- [ ] Polish: Loading states, accessibility, responsive

**Integration & Testing** (for `e2e-runner` subagent)
- [ ] End-to-end flow verification
- [ ] E2E tests for critical user journeys
- [ ] Unit and integration tests (as applicable)

### 4. **File Changes**

**New Files**
```
app/api/feature/route.ts
components/FeatureComponent.tsx
lib/feature-utils.ts
```

**Modified Files**
```
app/page.tsx (add new section)
lib/database.types.ts (add new types)
```

### 5. **Dependencies**

**npm packages to install**
```bash
npm install package-name
```

**Environment variables**
```bash
FEATURE_API_KEY=xxx
```

### 6. **Testing Strategy**

- Unit tests for utilities
- Integration tests for API
- Component tests for UI
- E2E test for full flow

### 7. **Rollout Plan**

- Feature flag if needed
- Gradual rollout strategy
- Rollback plan
- Monitoring and metrics

### 8. **Next Steps**

1. **Write the plan** to `docs/plans/<feature-slug>.md` (create `docs/plans` if needed).
2. Tell the user the plan file path and that they can run **project-manager** with that plan to delegate (Code ? code review ? loop if critical until production ready).
3. Do **not** spawn subagents or run project-manager in this commandùplan only.

---

## Do not delegate in this command

Do **not** spawn subagents or hand off to project-manager in this command. This command only produces and writes the plan. The user runs **project-manager** (with the plan file path) to delegate tasks to agents.
