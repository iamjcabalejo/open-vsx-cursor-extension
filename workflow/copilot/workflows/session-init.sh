#!/bin/bash
# Aligns with: token-policy, compounding-dev-cycle, core-standards
# Receives JSON via stdin: {"session_id":"...","is_background_agent":false,...}

CONTEXT='Plan-Code-Review workflow: Policies - (1) .github/instructions/token-policy.instructions.md: refine user input, hand off to agents/skills, XML blueprints only for complex/ambiguous/high-stakes work. (2) .github/instructions/compounding-dev-cycle.instructions.md: ASK->PLAN->AGENT, Plan->Code->Review; plan document is the contract. (3) .github/copilot-instructions.md core standards. Rationale (XML): extension README (Why XML beats a single prose prompt).'

printf '{"continue":true,"additional_context":"%s"}\n' "$(echo "$CONTEXT" | sed 's/"/\\"/g')"
exit 0
