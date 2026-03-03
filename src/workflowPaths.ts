import * as path from "path";

/** Assistant identifier for workflow source trees. */
export type WorkflowAssistant = "cursor" | "claude" | "copilot" | "codex";

const VALID_ASSISTANTS: WorkflowAssistant[] = ["cursor", "claude", "copilot", "codex"];

/**
 * Returns the source root for an assistant's workflow tree.
 * Content is read from extensionPath/workflow/<assistant>/ and copied/synced to the workspace or user dir.
 */
export function getWorkflowSourceRoot(
  extensionPath: string,
  assistant: WorkflowAssistant
): string {
  if (!VALID_ASSISTANTS.includes(assistant)) {
    throw new Error(`Invalid workflow assistant: ${assistant}`);
  }
  return path.join(extensionPath, "workflow", assistant);
}
