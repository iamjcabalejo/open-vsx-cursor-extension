import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const SKIP_DIRS = new Set([".git", "node_modules", "references"]);

export interface InstallCodexSkillsResult {
  success: boolean;
  message: string;
  details?: string[];
  /** Names of skills that were installed or updated. */
  installed?: string[];
  /** Names of skills skipped (missing SKILL.md). */
  skipped?: string[];
}

/**
 * Copy a directory recursively, skipping SKIP_DIRS.
 */
function copyDirRecursive(srcDir: string, destDir: string): void {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(srcDir, e.name);
    const destPath = path.join(destDir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const CODEX_SKILLS_ROOT = path.join(os.homedir(), ".codex", "skills");

/**
 * Remove from ~/.codex/skills only the skill folders with the given names.
 * Use this when removing only extension-installed skills (from manifest).
 */
export function removeCodexSkillsByNames(skillNames: string[]): InstallCodexSkillsResult {
  const removed: string[] = [];
  for (const name of skillNames) {
    const destPath = path.join(CODEX_SKILLS_ROOT, name);
    if (fs.existsSync(destPath)) {
      try {
        fs.rmSync(destPath, { recursive: true });
        removed.push(name);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          message: `Failed to remove skill "${name}": ${message}`,
          details: [destPath],
          installed: removed,
        };
      }
    }
  }
  const details =
    removed.length > 0
      ? [`Removed from ${CODEX_SKILLS_ROOT}`, ...removed.map((n) => `  - ${n}`)]
      : undefined;
  return {
    success: true,
    message:
      removed.length > 0
        ? `Removed ${removed.length} skill(s) from Codex.`
        : "No matching skills found in ~/.codex/skills.",
    details,
    installed: removed,
  };
}

/**
 * Sync skill folders from a source directory to ~/.codex/skills.
 * Each subfolder must contain SKILL.md; others are skipped.
 * Existing skills with the same name are overwritten (updated).
 * Use this for both "Apply workflow for Codex" and "Install skills to Codex".
 */
export function syncSkillsToCodexFromSource(skillsSrcDir: string): InstallCodexSkillsResult {
  if (!fs.existsSync(skillsSrcDir)) {
    return {
      success: false,
      message: `Skills source folder not found: ${skillsSrcDir}`,
      details: [skillsSrcDir],
    };
  }

  const installed: string[] = [];
  const skipped: string[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(skillsSrcDir, { withFileTypes: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to read skills source: ${message}`,
    };
  }

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const skillPath = path.join(skillsSrcDir, e.name);
    const skillMdPath = path.join(skillPath, "SKILL.md");
    if (!fs.existsSync(skillMdPath)) {
      skipped.push(e.name);
      continue;
    }
    const destPath = path.join(CODEX_SKILLS_ROOT, e.name);
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true });
    }
    try {
      copyDirRecursive(skillPath, destPath);
      installed.push(e.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Failed to copy skill "${e.name}": ${message}`,
        details: [destPath],
        installed,
        skipped,
      };
    }
  }

  if (installed.length === 0 && skipped.length === 0) {
    return {
      success: true,
      message: "No skill folders found in source.",
      details: [skillsSrcDir],
      installed: [],
      skipped: [],
    };
  }

  const details: string[] = [
    `Synced to ${CODEX_SKILLS_ROOT}`,
    ...installed.map((name) => `  - ${name}`),
  ];
  if (skipped.length > 0) {
    details.push("Skipped (no SKILL.md): " + skipped.join(", "));
  }

  return {
    success: true,
    message:
      installed.length > 0
        ? `Installed ${installed.length} skill(s) to Codex.`
        : "No valid skills to install (all missing SKILL.md).",
    details,
    installed,
    skipped,
  };
}

/**
 * Remove from ~/.codex/skills only the skill folders that exist in the extension's .cursor/skills.
 * Does not remove other skills the user may have added.
 */
export function removeCodexSkillsFromExtension(extensionPath: string): InstallCodexSkillsResult {
  const skillsSrcDir = path.join(extensionPath, ".cursor", "skills");
  if (!fs.existsSync(skillsSrcDir)) {
    return {
      success: true,
      message: "No skills source in extension; nothing to remove.",
      details: [skillsSrcDir],
    };
  }

  const removed: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(skillsSrcDir, { withFileTypes: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to list extension skills: ${message}`,
    };
  }

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const destPath = path.join(CODEX_SKILLS_ROOT, e.name);
    if (fs.existsSync(destPath)) {
      try {
        fs.rmSync(destPath, { recursive: true });
        removed.push(e.name);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          message: `Failed to remove skill "${e.name}": ${message}`,
          details: [destPath],
          installed: removed,
        };
      }
    }
  }

  const details =
    removed.length > 0
      ? [`Removed from ${CODEX_SKILLS_ROOT}`, ...removed.map((name) => `  - ${name}`)]
      : undefined;
  return {
    success: true,
    message:
      removed.length > 0
        ? `Removed ${removed.length} skill(s) from Codex.`
        : "No matching skills found in ~/.codex/skills.",
    details,
    installed: removed,
  };
}

/**
 * Install skills to ~/.codex/skills.
 * - If extensionPath is provided: sync from extensionPath/.cursor/skills (one-step, no .agents/skills).
 * - Otherwise: sync from workspaceRootPath/.agents/skills (legacy; run "Apply workflow for Codex" to sync from extension).
 * Each subfolder must contain SKILL.md; others are skipped.
 */
export function installCodexSkills(
  workspaceRootPath: string | undefined,
  extensionPath?: string
): InstallCodexSkillsResult {
  const skillsSrc = extensionPath
    ? path.join(extensionPath, ".cursor", "skills")
    : workspaceRootPath
      ? path.join(workspaceRootPath, ".agents", "skills")
      : undefined;

  if (!skillsSrc) {
    return {
      success: false,
      message: "No workspace folder open. Open a folder first, then run the command again.",
    };
  }

  if (!extensionPath && !fs.existsSync(skillsSrc)) {
    return {
      success: false,
      message:
        'No .agents/skills folder in this workspace. Use "Apply workflow for Codex" to sync skills from the extension to ~/.codex/skills.',
      details: [skillsSrc],
    };
  }

  return syncSkillsToCodexFromSource(skillsSrc);
}
