import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { AdapterContext, ApplyResult, RemoveResult } from "./types";
import { getWorkflowSourceRoot } from "../workflowPaths";
import {
  getWorkspaceManifest,
  getUserManifest,
  recordWorkspaceApplied,
  recordUserApplied,
  clearWorkspaceManifest,
  clearUserManifest,
} from "../workflowManifest";

const SKIP_DIRS = new Set([".git", "node_modules", ".vscode-test"]);

/** Recursively copy a directory, skipping SKIP_DIRS. */
function copyDirRecursive(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Apply workflow for Claude Code: copy from workflow/claude to .claude/ and CLAUDE.md.
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

  const claudeSrc = getWorkflowSourceRoot(extensionPath, "claude");
  if (!fs.existsSync(claudeSrc)) {
    return {
      success: false,
      message:
        "Extension workflow files not found. Ensure the extension was installed from a package that includes workflow/claude (e.g. Install from VSIX after building with `npm run compile && vsce package`).",
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
    if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });

    const agentsSrc = path.join(claudeSrc, "agents");
    const rulesSrc = path.join(claudeSrc, "rules");
    const skillsSrc = path.join(claudeSrc, "skills");
    const hooksSrc = path.join(claudeSrc, "hooks");

    if (fs.existsSync(agentsSrc)) {
      copyDirRecursive(agentsSrc, path.join(claudeDir, "agents"));
      details.push(".claude/agents/ (agent definitions)");
    }
    if (fs.existsSync(rulesSrc)) {
      copyDirRecursive(rulesSrc, path.join(claudeDir, "rules"));
      details.push(".claude/rules/ (compounding dev cycle, core standards, etc.)");
    }
    if (fs.existsSync(skillsSrc)) {
      copyDirRecursive(skillsSrc, path.join(claudeDir, "skills"));
      details.push(".claude/skills/ (skills with SKILL.md)");
    }
    if (fs.existsSync(hooksSrc)) {
      copyDirRecursive(hooksSrc, path.join(claudeDir, "hooks"));
      details.push(".claude/hooks/ (session-init, format, audit scripts)");

      const settingsPath = path.join(claudeDir, "settings.json");
      let settings: Record<string, unknown> = {};
      if (fs.existsSync(settingsPath)) {
        try {
          settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
        } catch (err) {
          console.warn(
            "Claude adapter: could not parse existing settings.json, using empty object",
            err instanceof Error ? err.message : String(err)
          );
        }
      }
      if (!(settings as { hooks?: unknown }).hooks) {
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

    const claudeMdSrc = path.join(claudeSrc, "CLAUDE.md");
    if (fs.existsSync(claudeMdSrc)) {
      fs.copyFileSync(claudeMdSrc, claudeMdPath);
      details.push(
        isUser ? "CLAUDE.md in ~/.claude/ (project rules)" : "CLAUDE.md (project rules)"
      );
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
