import * as fs from "fs";
import * as path from "path";

function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match ? match[1].trim() : content;
}

/**
 * Build the compounding dev cycle rule content from .cursor/rules/compounding-dev-cycle.mdc.
 * Used for user-level AGENTS.md (Codex) and user-level instructions (Copilot).
 */
export function buildCompoundingDevCycleContent(extensionPath: string): string {
  const rulePath = path.join(
    extensionPath,
    ".cursor",
    "rules",
    "compounding-dev-cycle.mdc"
  );
  if (!fs.existsSync(rulePath)) {
    return [
      "# Compounding Development Cycle",
      "",
      "Follow **Plan → Code → Review/Test → Plan** for every feature or change.",
      "Each phase produces handoff artifacts so the next agent can continue without loss of context.",
    ].join("\n");
  }
  const raw = fs.readFileSync(rulePath, "utf-8");
  return stripFrontmatter(raw);
}
