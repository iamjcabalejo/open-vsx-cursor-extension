import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { AdapterContext, ApplyResult, RemoveResult } from "./types";
import {
  getWorkspaceManifest,
  getUserManifest,
  recordWorkspaceApplied,
  recordUserApplied,
  clearWorkspaceManifest,
  clearUserManifest,
} from "../workflowManifest";

function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match ? match[1].trim() : content;
}

/** Recursively copy a directory (e.g. skills with SKILL.md and subdirs). */
function copyDirRecursive(src: string, dest: string): void {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildClaudeMd(extensionPath: string): string {
  const rulesDir = path.join(extensionPath, ".cursor", "rules");
  if (!fs.existsSync(rulesDir)) return "# Project rules\n\nNo rules found.";
  const entries = fs.readdirSync(rulesDir, { withFileTypes: true });
  const parts: string[] = [
    "# Plan-Code-Review workflow: rules and standards",
    "",
    "This file was generated from the Plan-Code-Review Workflow extension. Follow these rules and the compounding dev cycle (Plan → Code → Review/Test → Plan).",
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
 * Apply workflow for Claude Code: .claude/agents, .claude/rules, .claude/skills, CLAUDE.md, optional hooks in .claude/settings.json.
 * When claudeInstallTarget is "user", writes to ~/.claude/ (all projects). Otherwise writes to project root.
 */
export async function applyClaude(context: AdapterContext): Promise<ApplyResult> {
  const { extensionPath, workspaceRootPath, claudeInstallTarget = "project" } = context;
  const isUser = claudeInstallTarget === "user";

  if (!isUser && !workspaceRootPath) {
    return {
      success: false,
      message: "No workspace folder open. Open a folder first, then run the command again.",
    };
  }

  const claudeDir = isUser
    ? path.join(os.homedir(), ".claude")
    : path.join(workspaceRootPath!, ".claude");
  const claudeMdPath = isUser
    ? path.join(claudeDir, "CLAUDE.md")
    : path.join(workspaceRootPath!, "CLAUDE.md");

  const details: string[] = [];
  try {
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

    // Copy rules (.mdc and .md) so Claude Code loads them from .claude/rules/ (includes compounding dev cycle)
    const rulesSrc = path.join(extensionPath, ".cursor", "rules");
    const rulesDest = path.join(claudeDir, "rules");
    if (fs.existsSync(rulesSrc)) {
      if (!fs.existsSync(rulesDest)) fs.mkdirSync(rulesDest, { recursive: true });
      const ruleEntries = fs.readdirSync(rulesSrc, { withFileTypes: true });
      for (const e of ruleEntries) {
        if (!e.isFile()) continue;
        if (!e.name.endsWith(".mdc") && !e.name.endsWith(".md")) continue;
        if (e.name === "README.md") continue;
        fs.copyFileSync(path.join(rulesSrc, e.name), path.join(rulesDest, e.name));
      }
      details.push(".claude/rules/ (compounding dev cycle, core standards, etc.)");
    }

    // Copy skills (full tree: skill-name/SKILL.md and supporting files)
    const skillsSrc = path.join(extensionPath, ".cursor", "skills");
    const skillsDest = path.join(claudeDir, "skills");
    if (fs.existsSync(skillsSrc)) {
      copyDirRecursive(skillsSrc, skillsDest);
      details.push(".claude/skills/ (skills with SKILL.md)");
    }

    fs.writeFileSync(claudeMdPath, buildClaudeMd(extensionPath), "utf-8");
    details.push(
      isUser ? "CLAUDE.md in ~/.claude/ (project rules)" : "CLAUDE.md (project rules)"
    );

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
        if (!settings["$schema"]) {
          settings["$schema"] = "https://json.schemastore.org/claude-code-settings.json";
        }
        const hookCommand = isUser
          ? path.join(claudeDir, "hooks", "session-init.sh")
          : "$CLAUDE_PROJECT_DIR/.claude/hooks/session-init.sh";
        (settings as { hooks?: unknown }).hooks = {
          SessionStart: [
            {
              matcher: "*",
              hooks: [
                {
                  type: "command" as const,
                  command: hookCommand,
                },
              ],
            },
          ],
        };
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
        details.push(".claude/settings.json (SessionStart hook added)");
      }
    }

    if (isUser) {
      recordUserApplied({ claude: { appliedAt: new Date().toISOString() } });
    } else {
      recordWorkspaceApplied(workspaceRootPath!, { claude: { appliedAt: new Date().toISOString() } });
    }

    return {
      success: true,
      message: isUser
        ? "Claude Code workflow applied to ~/.claude/ (all projects)."
        : "Claude Code workflow applied to this workspace.",
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

/**
 * Remove Claude Code workflow only from locations recorded in the manifest (extension-added only).
 */
export async function removeClaude(context: AdapterContext): Promise<RemoveResult> {
  const { workspaceRootPath } = context;
  const details: string[] = [];
  const errors: string[] = [];
  const workspaceManifest = getWorkspaceManifest(workspaceRootPath);
  const userManifest = getUserManifest();

  function removeDir(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true });
        details.push(`Removed ${dirPath}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${dirPath}: ${message}`);
      }
    }
  }

  function removeFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        details.push(`Removed ${filePath}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${filePath}: ${message}`);
      }
    }
  }

  function clearHooksInSettings(settingsPath: string): void {
    if (!fs.existsSync(settingsPath)) return;
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8")) as Record<string, unknown>;
      if (settings.hooks) {
        delete settings.hooks;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
        details.push(`Cleared hooks from ${settingsPath}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${settingsPath}: ${message}`);
    }
  }

  const targets: { claudeDir: string; claudeMdPath: string }[] = [];
  if (workspaceRootPath && workspaceManifest?.claude) {
    targets.push({
      claudeDir: path.join(workspaceRootPath, ".claude"),
      claudeMdPath: path.join(workspaceRootPath, "CLAUDE.md"),
    });
  }
  if (userManifest?.claude) {
    const homeClaude = path.join(os.homedir(), ".claude");
    targets.push({
      claudeDir: homeClaude,
      claudeMdPath: path.join(homeClaude, "CLAUDE.md"),
    });
  }

  for (const { claudeDir, claudeMdPath } of targets) {
    removeDir(path.join(claudeDir, "agents"));
    removeDir(path.join(claudeDir, "rules"));
    removeDir(path.join(claudeDir, "skills"));
    removeDir(path.join(claudeDir, "hooks"));
    removeFile(claudeMdPath);
    clearHooksInSettings(path.join(claudeDir, "settings.json"));
  }

  if (workspaceRootPath && workspaceManifest?.claude) {
    clearWorkspaceManifest(workspaceRootPath, ["claude"]);
  }
  if (userManifest?.claude) {
    clearUserManifest(["claude"]);
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: "Failed to remove some Claude workflow files: " + errors.join("; "),
      details,
    };
  }
  const removed = targets.length > 0;
  return {
    success: true,
    message: removed
      ? "Claude Code workflow removed from recorded locations only."
      : "No Claude workflow applied by this extension (nothing to remove).",
    details: details.length > 0 ? details : undefined,
  };
}
