#!/bin/bash
# Runs when a new composer session starts.
# Aligns with: token-policy.mdc, compounding-dev-cycle.mdc, core-standards.mdc
# Receives JSON via stdin: {"session_id":"...","is_background_agent":false,...}
# Output: {"env":{...},"additional_context":"...","continue":true}

CONTEXT='Plan-Code-Review workflow: Policies in .cursor/rules/ - (1) token-policy.mdc: refine user input, hand off to commands/skills/agents, use internal XML blueprints only for complex/ambiguous/high-stakes work. (2) compounding-dev-cycle.mdc: ASK->PLAN->AGENT, Plan->Code->Review; plan document is the contract. (3) core-standards.mdc: applies with (1)(2); type safety, errors, security boundaries. Product flow: feature-plan -> project-manager; repeat until no Critical rework. Rationale (XML): extension README (Why XML beats a single prose prompt).'

printf '{"continue":true,"additional_context":"%s"}\n' "$(echo "$CONTEXT" | sed 's/"/\\"/g')"
exit 0
