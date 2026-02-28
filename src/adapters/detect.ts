import * as vscode from "vscode";
import type { AIAssistant } from "./types";

const EXTENSION_IDS: Record<AIAssistant, string | undefined> = {
  cursor: undefined, // Cursor is the host app, not an extension
  claude: "Anthropic.claude-code",
  copilot: "GitHub.copilot",
  codex: "openai.chatgpt",
};

/**
 * Detects which AI assistant(s) are available in this environment.
 * Cursor: app name is "Cursor". Others: presence of their VS Code extension.
 */
export function detectAvailableAssistants(): AIAssistant[] {
  const result: AIAssistant[] = [];
  const appName = (vscode.env as { appName?: string }).appName ?? "";
  if (appName.includes("Cursor")) {
    result.push("cursor");
  }
  const extensions = vscode.extensions.all;
  for (const [assistant, id] of Object.entries(EXTENSION_IDS)) {
    if (!id) continue;
    if (extensions.some((e) => e.id.toLowerCase() === id.toLowerCase())) {
      result.push(assistant as AIAssistant);
    }
  }
  return result;
}

/**
 * Picks the best assistant to apply workflow for when user chooses "current AI".
 * Prefers Cursor if we're in Cursor, otherwise first available of Claude / Copilot / Codex.
 */
export function recommendAssistant(): AIAssistant | undefined {
  const available = detectAvailableAssistants();
  if (available.length === 0) return undefined;
  // Prefer Cursor when in Cursor; otherwise first installed
  if (available.includes("cursor")) return "cursor";
  return available[0];
}
