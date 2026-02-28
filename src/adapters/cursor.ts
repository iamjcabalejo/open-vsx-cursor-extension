import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { AdapterContext, ApplyResult } from "./types";

const SKIP_DIRS = new Set([".git", "node_modules", ".vscode-test"]);

function copyDirRecursive(srcDir: string, destDir: string): string[] {
  const copied: string[] = [];
  if (!fs.existsSync(srcDir)) return copied;
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    copied.push(path.relative(path.dirname(destDir), destDir));
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(srcDir, e.name);
    const destPath = path.join(destDir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      copied.push(...copyDirRecursive(srcPath, destPath));
    } else {
      fs.copyFileSync(srcPath, destPath);
      copied.push(path.relative(destDir, destPath));
    }
  }
  return copied;
}

/**
 * Copy .cursor and .cursor-plugin from extension to workspace or user directory.
 * When cursorInstallTarget is "user", copies to ~/.cursor and ~/.cursor-plugin (all projects).
 */
export async function applyCursor(context: AdapterContext): Promise<ApplyResult> {
  const { extensionPath, workspaceRootPath, cursorInstallTarget = "project" } = context;
  const isUser = cursorInstallTarget === "user";

  if (!isUser && !workspaceRootPath) {
    return {
      success: false,
      message: "No workspace folder open. Open a folder first, then run the command again.",
    };
  }

  const cursorSrc = path.join(extensionPath, ".cursor");
  const pluginSrc = path.join(extensionPath, ".cursor-plugin");
  if (!fs.existsSync(cursorSrc) || !fs.existsSync(pluginSrc)) {
    return {
      success: false,
      message: "Workflow files not found in extension. Reinstall the extension.",
    };
  }
  const baseDest = isUser ? os.homedir() : workspaceRootPath!;
  const cursorDest = path.join(baseDest, ".cursor");
  const pluginDest = path.join(baseDest, ".cursor-plugin");
  const details: string[] = [];
  try {
    copyDirRecursive(cursorSrc, cursorDest);
    details.push(".cursor/ (rules, agents, skills, commands, hooks)");
    copyDirRecursive(pluginSrc, pluginDest);
    details.push(".cursor-plugin/ (plugin.json)");
    return {
      success: true,
      message: isUser
        ? "Cursor workflow applied to ~/.cursor and ~/.cursor-plugin (all projects)."
        : "Cursor workflow applied to this workspace.",
      details,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to copy workflow: ${message}`,
      details: [cursorSrc, pluginSrc],
    };
  }
}
