import * as fs from "fs";
import * as path from "path";
import type { AdapterContext, ApplyResult } from "./types";

function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match ? match[1].trim() : content;
}

function buildClaudeMd(extensionPath: string): string {
  const rulesDir = path.join(extensionPath, ".cursor", "rules");
  if (!fs.existsSync(rulesDir)) return "# Project rules\n\nNo rules found.";
  const entries = fs.readdirSync(rulesDir, { withFileTypes: true });
  const parts: string[] = [
    "# Payoy's workflow: rules and standards",
    "",
    "This file was generated from the Payoy's Cursor Sub-Agents extension. Follow these rules and the compounding dev cycle (Plan → Code → Review/Test → Plan).",
    "",
  ];
  for (const e of entries) {
    if (!e.isFile() || (!e.name.endsWith(".mdc") && !e.name.endsWith(".md"))) continue;
    if (e.name === "README.md") continue;
    const filePath = path.join(rulesDir, e.name);
    const raw = fs.readFileSync(filePath, "utf-8");
    const body = stripFrontmatter(raw);
    parts.push(`## ${e.name.replace(/\.(mdc|md)$/, "").replace(/-/g, " ")}`);
    parts.push("");
    parts.push(body);
    parts.push("");
  }
  return parts.join("\n");
}

/**
 * Apply workflow for Claude Code: .claude/agents, CLAUDE.md, optional hooks in .claude/settings.json.
 */
export async function applyClaude(context: AdapterContext): Promise<ApplyResult> {
  const { extensionPath, workspaceRootPath } = context;
  if (!workspaceRootPath) {
    return {
      success: false,
      message: "No workspace folder open. Open a folder first, then run the command again.",
    };
  }
  const details: string[] = [];
  try {
    const claudeDir = path.join(workspaceRootPath, ".claude");
    const agentsSrc = path.join(extensionPath, ".cursor", "agents");
    const agentsDest = path.join(claudeDir, "agents");
    const hooksSrc = path.join(extensionPath, ".cursor", "hooks");

    if (!fs.existsSync(agentsSrc)) {
      return {
        success: false,
        message:
          "Extension workflow files not found. Ensure the extension was installed from a package that includes .cursor and .cursor-plugin (e.g. Install from VSIX after building with `npm run compile && vsce package`).",
      };
    }

    if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });
    if (!fs.existsSync(agentsDest)) fs.mkdirSync(agentsDest, { recursive: true });

    // Copy agents (.md only)
    const agentFiles = fs.readdirSync(agentsSrc);
    for (const f of agentFiles) {
      if (!f.endsWith(".md")) continue;
      fs.copyFileSync(path.join(agentsSrc, f), path.join(agentsDest, f));
    }
    details.push(".claude/agents/ (agent definitions)");

    // CLAUDE.md at project root (Claude Code reads CLAUDE.md or .claude/CLAUDE.md)
    const claudeMdPath = path.join(workspaceRootPath, "CLAUDE.md");
    fs.writeFileSync(claudeMdPath, buildClaudeMd(extensionPath), "utf-8");
    details.push("CLAUDE.md (project rules)");

    // Optional: copy hook scripts and add hooks to settings
    const hooksDest = path.join(claudeDir, "hooks");
    if (fs.existsSync(hooksSrc)) {
      if (!fs.existsSync(hooksDest)) fs.mkdirSync(hooksDest, { recursive: true });
      for (const f of fs.readdirSync(hooksSrc)) {
        if (f.endsWith(".sh")) {
          fs.copyFileSync(path.join(hooksSrc, f), path.join(hooksDest, f));
        }
      }
      details.push(".claude/hooks/ (session-init, format, audit scripts)");

      const settingsPath = path.join(claudeDir, "settings.json");
      let settings: Record<string, unknown> = {};
      if (fs.existsSync(settingsPath)) {
        try {
          settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
        } catch {
          // keep empty
        }
      }
      if (!settings.hooks) {
        (settings as { hooks?: unknown }).hooks = {
          SessionStart: [
            {
              matcher: "*",
              hooks: [
                { type: "command" as const, command: ".claude/hooks/session-init.sh" },
              ],
            },
          ],
        };
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
        details.push(".claude/settings.json (SessionStart hook added)");
      }
    }

    return {
      success: true,
      message: "Claude Code workflow applied to this workspace.",
      details,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to apply Claude workflow: ${message}`,
      details,
    };
  }
}
