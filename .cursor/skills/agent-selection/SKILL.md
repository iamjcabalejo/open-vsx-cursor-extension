---
name: agent-selection
description: Select and load relevant agent definitions before a task. Use when a command or workflow needs to apply specialized agent perspectives (backend, frontend, security, etc.) without duplicating the full agent list in every command.
---

# Agent Selection and Definition Loading

Use this skill whenever a command instructs you to "apply the agent-selection skill" or "follow agent-selection": identify which agents are relevant, load their definitions, and apply their perspective to the task.

## 1. Identify Relevant Agents

From the task or feature description, determine which agent(s) apply:

| Domain | Agent |
|--------|--------|
| Backend / API | backend-architect |
| Frontend / UI | frontend-architect |
| Database / schema / queries | database-expert |
| System architecture | system-architect |
| Security (auth, sensitive data) | security-engineer |
| Performance (bottlenecks, optimization) | performance-engineer |
| Research / technology choices | tech-stack-researcher |
| Learning / explanations | learning-guide |
| Documentation | technical-writer |
| Requirements / discovery | requirements-analyst |
| Refactoring / code quality | refactoring-expert |
| E2E / integration testing | e2e-runner |
| Patterns / consistency | pattern-recognition-specialist |
| Architecture compliance | architecture-strategist |

The command may override this with a **Relevant agents for this command** list; use that when provided.

## 2. Read Agent Definitions

- Load the relevant agent definition files from `.cursor/agents/<agent-name>.md`.
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

Agent definitions live in `.cursor/agents/`. The plugin manifest (`.cursor-plugin/plugin.json`) lists all available agents; use it to discover names and paths. Commands that use this skill may list only the subset of agents relevant to that command.
