# AGENTS.md — Compounding dev cycle and custom agents

**All custom agents and work in this repo MUST follow the compounding development cycle** (Plan → Code → Review/Test → Plan).

**Full cycle:** See **`.github/instructions/compounding-dev-cycle.instructions.md`** (path-specific instructions with `applyTo: "**"`; Copilot uses it together with this file and `.github/copilot-instructions.md`).

## Mode mapping (Copilot + cross-assistant)

Use Copilot modes explicitly by phase:
- **Plan/discovery:** Copilot **Plan mode** only (no implementation).
- **Implementation:** Copilot **Agent mode**.
- **Review/explanation:** Copilot **Ask mode** (read-only).

Cross-assistant equivalence:
- Cursor: Plan / Agent / Ask
- Claude Code: Plan / Normal (or Auto-accept) / Plan-or-Normal-read-only
- Codex: plan-before-execute / agent execution / read-only review behavior

## Token-efficient response policy (always on)

Apply token-efficient mode by default for all Copilot workflows in this repo.

- **Default intensity:** `full`
- **Supported levels:** `lite`, `full`, `ultra`
- **Rule:** concise but complete; preserve required sections in command outputs and review artifacts.
- **Auto-clarity override:** switch to explicit full-language warnings for destructive actions, security-sensitive operations, irreversible effects, or ambiguity-prone step sequences.

### RiskControls
- **R-1 Clarity regression:** enforce auto-clarity override and explicit warning language.
- **R-2 Cross-ecosystem drift:** keep this policy semantically aligned with Cursor/Codex/Claude docs.
- **R-3 Format conflicts:** preserve mandatory command schemas before compressing prose.
- **R-4 Level inconsistency:** keep `lite/full/ultra` definitions/examples aligned in skills and agent files.

---

## Custom agents (GitHub Copilot)

Custom agents are stored as `<name>.agent.md` under **`.github/agents/`**. When adding or editing agents:

1. Create or update files in **`.github/agents/`** with the naming convention **`<name>.agent.md`**.
2. **Always follow the compounding dev cycle** (Plan → Code → Review/Test → Plan); see `.github/instructions/compounding-dev-cycle.instructions.md`.
3. Each agent definition should reference this cycle and produce handoff artifacts (plan doc, implementation notes, rework list) so the next phase or agent can continue without loss of context.
4. **Skills**: Because GitHub Copilot does not load skills separately, each `.github/agents/<name>.agent.md` file includes **inlined skills** (checklists, patterns, and criteria for that agent). When acting as an agent, apply the skills section at the bottom of its file.

**Repository layout for GitHub Copilot:**

- **`.github/agents/`** — Custom agents (`<name>.agent.md`); follow compounding dev cycle.
- **`.github/copilot-instructions.md`** — Rules and agent roles (project-wide instructions).
- **`.github/instructions/compounding-dev-cycle.instructions.md`** — Compounding dev cycle (path-specific, applies to all files).
- **`.github/workflows/`** — Hooks (hooks.json, README, scripts for session/audit/format).
- **`.github/ISSUE_TEMPLATE/`** — Structured prompts (feature, bug report, review request) for the Plan phase.

**Agent files in this workspace** (`.github/agents/*.agent.md`):

- **ai-automation-expert** (ai-automation-expert.agent.md): Writes high-quality skills, agent definitions, and workflows for AI to follow. Use when asked to create or refine technical skills, agent workflows, automation instructions, or SKILL.md/agent.md content with strict rules, styles, and philosophy.
- **architecture-strategist** (architecture-strategist.agent.md): "Analyzes code changes from an architectural perspective for pattern compliance and design integrity. Use when reviewing PRs, adding services, or evaluating structural refactors."
- **backend-architect** (backend-architect.agent.md): Design reliable backend systems with focus on data integrity, security, and fault tolerance
- **backend-reviewer** (backend-reviewer.agent.md): Review backend code for correctness, security, API contract, and data integrity; produce concrete rework lists for the Plan→Code cycle
- **database-expert** (database-expert.agent.md): Optimize queries and ensure data access follows best practices with deep DBA expertise
- **deep-research-agent** (deep-research-agent.agent.md): Specialist for comprehensive research with adaptive strategies and intelligent exploration
- **e2e-runner** (e2e-runner.agent.md): Design and execute best-in-class end-to-end tests with focus on reliability, coverage, and maintainability
- **frontend-architect** (frontend-architect.agent.md): Create accessible, performant user interfaces with focus on user experience and modern frameworks
- **frontend-reviewer** (frontend-reviewer.agent.md): Review frontend code for correctness, accessibility, performance, and standards; produce concrete rework lists for the Plan→Code cycle
- **learning-guide** (learning-guide.agent.md): Teach programming concepts and explain code with focus on understanding through progressive learning and practical examples
- **pattern-recognition-specialist** (pattern-recognition-specialist.agent.md): "Analyzes code for design patterns, anti-patterns, naming conventions, and duplication. Use when checking codebase consistency or verifying new code follows established patterns."
- **performance-engineer** (performance-engineer.agent.md): Optimize system performance through measurement-driven analysis and bottleneck elimination
- **refactoring-expert** (refactoring-expert.agent.md): Improve code quality and reduce technical debt through systematic refactoring and clean code principles
- **requirements-analyst** (requirements-analyst.agent.md): Transform ambiguous project ideas into concrete specifications through systematic requirements discovery and structured analysis
- **security-engineer** (security-engineer.agent.md): Identify security vulnerabilities and ensure compliance with security standards and best practices
- **system-architect** (system-architect.agent.md): Design scalable system architecture with focus on maintainability and long-term technical decisions
- **tech-stack-researcher** (tech-stack-researcher.agent.md): Use this agent when the user is planning new features or functionality and needs guidance on technology choices, architecture decisions, or implementation approaches. Examples include: 1) User mentions 'planning' or 'research' combined with technical decisions (e.g., 'I'm planning to add real-time notifications, what should I use?'), 2) User asks about technology comparisons or recommendations (e.g., 'should I use WebSockets or Server-Sent Events?'), 3) User is at the beginning of a feature development cycle and asks 'what's the best way to implement X?', 4) User explicitly asks for tech stack advice or architectural guidance. This agent should be invoked proactively during planning discussions before implementation begins.
- **technical-writer** (technical-writer.agent.md): Create clear, comprehensive technical documentation tailored to specific audiences with focus on usability and accessibility

---
*Generated by Plan-Code-Review Workflow extension for GitHub Copilot.*