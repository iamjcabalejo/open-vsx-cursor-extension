#!/bin/bash
# Runs when a new composer session starts.
# Can inject env vars, additional context, or block session creation.
# Receives JSON via stdin: {"session_id":"...","is_background_agent":false,...}
# Output: {"env":{...},"additional_context":"...","continue":true}
#
# Aligns with compounding-dev-cycle.md: injects cycle reminder so agents
# follow Plan → Code → Review/Test → Plan and use plan doc as contract.

CONTEXT="Follow Plan → Code → Review/Test → Plan (.github/copilot-instructions.md and .github/instructions/compounding-dev-cycle.md). Plan first (feature-plan), then Code to the plan; Review/Test produces rework list; repeat until production ready. Plan doc is the single source of truth—update it when scope or acceptance criteria change."

# Allow session and inject cycle context for handoff-aware behavior
printf '{"continue":true,"additional_context":"%s"}\n' "$(echo "$CONTEXT" | sed 's/"/\\"/g')"
exit 0
