import type { WorkflowAdapter, AIAssistant } from "./types";
import { applyCursor } from "./cursor";
import { applyClaude } from "./claude";
import { applyCopilot } from "./copilot";
import { applyCodex } from "./codex";

export type { AIAssistant, AdapterContext, ApplyResult, WorkflowAdapter } from "./types";
export { detectAvailableAssistants, recommendAssistant } from "./detect";

const adapters: WorkflowAdapter[] = [
  {
    id: "cursor",
    name: "Cursor",
    description: "Copy .cursor and .cursor-plugin into this workspace",
    apply: applyCursor,
  },
  {
    id: "claude",
    name: "Claude Code",
    description: "Create .claude/agents, CLAUDE.md, and optional hooks",
    extensionId: "Anthropic.claude-code",
    apply: applyClaude,
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    description: "Create .github/copilot-instructions.md and AGENTS.md",
    extensionId: "GitHub.copilot",
    apply: applyCopilot,
  },
  {
    id: "codex",
    name: "Codex",
    description: "Create .agents/skills and AGENTS.md",
    extensionId: "openai.chatgpt",
    apply: applyCodex,
  },
];

export function getAdapters(): WorkflowAdapter[] {
  return adapters;
}

export function getAdapter(id: AIAssistant): WorkflowAdapter | undefined {
  return adapters.find((a) => a.id === id);
}
