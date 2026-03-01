/**
 * Supported AI assistants and their workflow targets.
 */
export type AIAssistant = "cursor" | "claude" | "copilot" | "codex";

export interface AdapterContext {
  /** Extension root path (where .cursor and .cursor-plugin live). */
  extensionPath: string;
  /** Workspace root path, or undefined if no folder open. */
  workspaceRootPath: string | undefined;
  /** When applying Claude workflow: install in project (.claude) or user dir (~/.claude). */
  claudeInstallTarget?: "project" | "user";
  /** When applying Cursor workflow: install in project (.cursor) or user dir (~/.cursor). */
  cursorInstallTarget?: "project" | "user";
}

export interface ApplyResult {
  success: boolean;
  message: string;
  details?: string[];
}

/** Same shape as ApplyResult; used for remove operations. */
export type RemoveResult = ApplyResult;

/** Adapter that applies this extension's workflow to a specific AI assistant. */
export interface WorkflowAdapter {
  id: AIAssistant;
  name: string;
  description: string;
  /** VS Code extension ID used to detect if this assistant is available. */
  extensionId?: string;
  apply(context: AdapterContext): Promise<ApplyResult>;
  /** Remove workflow artifacts added by this extension. Optional; if absent, remove is no-op. */
  remove?(context: AdapterContext): Promise<RemoveResult>;
}
