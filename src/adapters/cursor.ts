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
    if (isUser) {
      recordUserApplied({ cursor: { appliedAt: new Date().toISOString() } });
    } else {
      recordWorkspaceApplied(workspaceRootPath!, { cursor: { appliedAt: new Date().toISOString() } });
    }
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

/**
 * Remove Cursor workflow only from locations recorded in the manifest (extension-added only).
 */
export async function removeCursor(context: AdapterContext): Promise<RemoveResult> {
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

  const home = os.homedir();
  let clearedWorkspace = false;
  let clearedUser = false;

  if (workspaceRootPath && workspaceManifest?.cursor) {
    removeDir(path.join(workspaceRootPath, ".cursor"));
    removeDir(path.join(workspaceRootPath, ".cursor-plugin"));
    clearedWorkspace = true;
  }
  if (userManifest?.cursor) {
    removeDir(path.join(home, ".cursor"));
    removeDir(path.join(home, ".cursor-plugin"));
    clearedUser = true;
  }

  if (clearedWorkspace && workspaceRootPath) {
    clearWorkspaceManifest(workspaceRootPath, ["cursor"]);
  }
  if (clearedUser) {
    clearUserManifest(["cursor"]);
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: "Failed to remove some Cursor workflow files: " + errors.join("; "),
      details,
    };
  }
  const removed = clearedWorkspace || clearedUser;
  return {
    success: true,
    message: removed
      ? "Cursor workflow removed from recorded locations only."
      : "No Cursor workflow applied by this extension (nothing to remove).",
    details: details.length > 0 ? details : undefined,
  };
}
