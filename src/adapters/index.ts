import type { WorkflowAdapter, AIAssistant, RemoveResult } from "./types";
import { applyCursor, removeCursor } from "./cursor";
import { applyClaude, removeClaude } from "./claude";
import { applyCopilot, removeCopilot } from "./copilot";
import { applyCodex, removeCodex } from "./codex";

export type {
  AIAssistant,
  AdapterContext,
  ApplyResult,
  WorkflowAdapter,
} from "./types";
export { detectAvailableAssistants, recommendAssistant } from "./detect";

const adapters: WorkflowAdapter[] = [
  {
    id: "cursor",
    name: "Cursor",
    description: "Copy .cursor and .cursor-plugin into this workspace",
    apply: applyCursor,
    remove: removeCursor,
  },
  {
    id: "claude",
    name: "Claude Code",
    description: "Create .claude/agents, CLAUDE.md, and optional hooks",
    extensionId: "Anthropic.claude-code",
    apply: applyClaude,
    remove: removeClaude,
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    description: "Create .github/copilot-instructions.md and AGENTS.md",
    extensionId: "GitHub.copilot",
    apply: applyCopilot,
    remove: removeCopilot,
  },
  {
    id: "codex",
    name: "Codex",
    description:
      "Install Codex workflow in project (.codex/) or user dir (~/.codex)",
    extensionId: "openai.chatgpt",
    apply: applyCodex,
    remove: removeCodex,
  },
];

export function getAdapters(): WorkflowAdapter[] {
  return adapters;
}

export function getAdapter(id: AIAssistant): WorkflowAdapter | undefined {
  return adapters.find((a) => a.id === id);
}

/**
 * Run remove() for every adapter that supports it. Aggregates results.
 */
export async function removeWorkflowAll(context: {
  extensionPath: string;
  workspaceRootPath: string | undefined;
}): Promise<{ success: boolean; message: string; details: string[] }> {
  const adapterContext = {
    extensionPath: context.extensionPath,
    workspaceRootPath: context.workspaceRootPath,
  };
  const allDetails: string[] = [];
  const failures: string[] = [];

  for (const adapter of adapters) {
    if (!adapter.remove) continue;
    try {
      const result: RemoveResult = await adapter.remove(adapterContext);
      if (result.success && result.details?.length) {
        allDetails.push(
          `${adapter.name}:`,
          ...result.details.map((d) => `  ${d}`),
        );
      } else if (!result.success) {
        failures.push(`${adapter.name}: ${result.message}`);
        if (result.details?.length) {
          allDetails.push(
            `${adapter.name}:`,
            ...result.details.map((d) => `  ${d}`),
          );
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${adapter.name}: ${message}`);
    }
  }

  const success = failures.length === 0;
  const message = success
    ? "Workflow removed from all AI assistants (Cursor, Claude, Copilot, Codex)."
    : `Some removals failed: ${failures.join("; ")}`;
  return {
    success,
    message,
    details: allDetails,
  };
}
