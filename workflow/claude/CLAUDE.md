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

## Token-efficient response policy (always on)

Apply token-efficient mode by default for all Claude workflows in this repo.

- **Default intensity:** `full`
- **Supported levels:** `lite`, `full`, `ultra`
- **Rule:** concise but complete; preserve required structures from commands, plans, and review outputs.
- **Auto-clarity override:** switch to explicit full-language warnings for destructive operations, security-sensitive guidance, irreversible outcomes, or ambiguity-prone multi-step instructions.

### RiskControls
- **R-1 Clarity regression:** enforce auto-clarity override and explicit high-risk warning wording.
- **R-2 Cross-ecosystem drift:** keep policy semantics aligned with Cursor/Codex/Copilot docs.
- **R-3 Format conflicts:** preserve mandatory output schemas and required sections before compressing prose.
- **R-4 Level inconsistency:** keep `lite/full/ultra` definitions and examples aligned in skills/agents/commands.

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

## compounding dev cycle

(See .claude/rules/compounding-dev-cycle.md)
