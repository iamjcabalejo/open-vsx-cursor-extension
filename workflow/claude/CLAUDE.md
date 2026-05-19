# Plan-Code-Review workflow: rules and standards

This file was generated from the Plan-Code-Review Workflow extension. Follow these rules and the compounding dev cycle (Plan → Code → Review/Test → Plan).

## Mode mapping (Claude + cross-assistant)

Use Claude modes explicitly by phase:

- **Plan/discovery:** Claude **Plan mode** only (no implementation).
- **Implementation:** Claude **Normal** or **Auto-accept** mode.
- **Review/explanation:** Claude **Plan mode** (preferred) or **Normal** with explicit read-only instruction (no edits).

Cross-assistant equivalence:

- Cursor: Plan / Agent / Ask
- GitHub Copilot: Plan / Agent / Ask
- Codex: plan-before-execute / agent execution / read-only review behavior

## token policy (always on)

Apply **`.claude/rules/token-policy.md`** in every session: refine → hand off, concise but complete responses, lean diffs, internal XML blueprints for complex work.

## core standards

(See .claude/rules/core-standards.md)

## api routes

(See .claude/rules/api-routes.md)

## typescript

(See .claude/rules/typescript.md)

## react

(See .claude/rules/react.md)

## e2e tests

(See .claude/rules/e2e-tests.md)

## token policy

(See .claude/rules/token-policy.md)

## compounding dev cycle

(See .claude/rules/compounding-dev-cycle.md)
