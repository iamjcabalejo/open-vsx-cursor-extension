#!/bin/bash
# Aligns with: token-policy.md, compounding-dev-cycle.md, core-standards.md
# Receives JSON via stdin (Claude Code SessionStart hook).

CONTEXT='Plan-Code-Review workflow: Policies in .claude/rules/ - (1) token-policy.md: refine user input, hand off to skills/agents, use internal XML blueprints only for complex/ambiguous/high-stakes work. (2) compounding-dev-cycle.md: ASK->PLAN->AGENT, Plan->Code->Review; plan document is the contract. (3) core-standards.md: applies with (1)(2); type safety, errors, security boundaries. Rationale (XML): extension README (Why XML beats a single prose prompt).'

printf '{"continue":true,"additional_context":"%s"}\n' "$(echo "$CONTEXT" | sed 's/"/\\"/g')"
exit 0
