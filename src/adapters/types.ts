/**
 * Supported AI assistants and their workflow targets.
 */
export type AIAssistant = "cursor" | "claude" | "copilot" | "codex";

export interface AdapterContext {
  /** Extension root path (where .cursor and .cursor-plugin live). */
  extensionPath: string;
  /** Workspace root path, or undefined if no folder open. */
  workspaceRootPath: string | undefined;
}

export interface ApplyResult {
  success: boolean;
  message: string;
  details?: string[];
}

/** Adapter that applies this extension's workflow to a specific AI assistant. */
export interface WorkflowAdapter {
  id: AIAssistant;
  name: string;
  description: string;
  /** VS Code extension ID used to detect if this assistant is available. */
  extensionId?: string;
  apply(context: AdapterContext): Promise<ApplyResult>;
}
