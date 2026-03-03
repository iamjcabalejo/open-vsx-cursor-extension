---
name: agent-selection
description: Select and load relevant agent definitions before a task. Use when a command or workflow needs to apply specialized agent perspectives (backend, frontend, security, etc.) without duplicating the full agent list in every command.
---

# Agent Selection and Definition Loading

Use this skill whenever a command instructs you to "apply the agent-selection skill" or "follow agent-selection": identify which agents are relevant, load their definitions, and apply their perspective to the task.

## 1. Identify Relevant Agents

Discover available agents from **`AGENTS.md `** (the plugin manifest `.cursor-plugin/plugin.json` points `"agents"` to that folder). For each task, pick the agent(s) whose domain matches. The command may override with a **Relevant agents for this command** list; use that when provided.

| Domain | Agent | When to use |
|--------|--------|-------------|
| **Skills / agent workflows** | **ai-automation-expert** | **Write or refine technical skills, agent definitions, SKILL.md, or automation rules with strict style and philosophy** |
| Architecture / compliance | architecture-strategist | PRs, adding services, structural refactors, pattern compliance |
| Backend / API | backend-architect | APIs, server-side code, databases |
| Backend review | backend-reviewer | Review APIs, server logic, data integrity; produce rework lists |
| Database / schema / queries | database-expert | Schema design, migrations, queries, indexing, DBA-level tuning |
| Research / deep investigation | deep-research-agent | Comprehensive research, adaptive strategies |
| E2E / integration testing | e2e-runner | Playwright E2E tests, coverage, critical paths |
| Frontend / UI | frontend-architect | UI, components, accessibility, client-side code |
| Frontend review | frontend-reviewer | Review UI, a11y, performance; produce rework lists |
| Learning / explanations | learning-guide | Teaching concepts, explaining code |
| Patterns / consistency | pattern-recognition-specialist | Design patterns, anti-patterns, naming, duplication |
| Performance | performance-engineer | Bottlenecks, optimization, measurement-driven analysis |
| Refactoring / code quality | refactoring-expert | Technical debt, safe refactors, clean code |
| Requirements / discovery | requirements-analyst | PRDs, user stories, acceptance criteria |
| Security | security-engineer | Auth, sensitive data, OWASP-aligned checks |
| System architecture | system-architect | Scalable design, maintainability, technical decisions |
| Technology choices | tech-stack-researcher | New features, tech comparisons, implementation options |
| Documentation | technical-writer | APIs, guides, README, docs structure |

**Cursor-only subagent types** (for task spawning, e.g. `mcp_task`): `generalPurpose`, `explore`, `shell`, `docs-researcher`. These may not have definition files in `AGENTS.md `; use them when the workflow requires general-purpose execution, codebase exploration, shell commands, or docs lookup.

## 2. Read Agent Definitions

- Load the relevant agent definition files from `AGENTS.md <agent-name>.md`.
- Read frontmatter (name, description), triggers, behavioral mindset, focus areas, key actions, and boundaries.

## 3. Apply Agent Perspective

- Use each agent’s behavioral mindset when analyzing or executing the task.
- Apply the agent’s focus areas to the work (e.g. security checks, performance considerations).
- Follow the agent’s key actions and respect boundaries (what the agent will/will not do).

## 4. Multi-Agent Tasks

If the task spans multiple domains:

- Identify all relevant agents and read each definition.
- Plan how their perspectives integrate and separate concerns in the output (e.g. Backend Tasks vs Frontend Tasks).

## Single Source of Truth

- **Agent definitions:** `AGENTS.md ` — one `.md` file per agent (e.g. `backend-architect.md`, `frontend-reviewer.md`). The table above reflects the agents present in this folder.
- Commands that use this skill may list only the **subset** of agents relevant to that command (e.g. feature-plan, project-manager).
