import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const SKIP_DIRS = new Set([".git", "node_modules", "references"]);

export interface InstallCodexSkillsResult {
  success: boolean;
  message: string;
  details?: string[];
  /** Names of skills that were installed (or skipped if dry run). */
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

/**
 * Install skills from workspace .agents/skills to ~/.codex/skills/<skill-name>.
 * Each subfolder of .agents/skills must contain SKILL.md; others are skipped.
 */
export function installCodexSkills(workspaceRootPath: string | undefined): InstallCodexSkillsResult {
  if (!workspaceRootPath) {
    return {
      success: false,
      message: "No workspace folder open. Open a folder first, then run the command again.",
    };
  }

  const skillsSrc = path.join(workspaceRootPath, ".agents", "skills");
  if (!fs.existsSync(skillsSrc)) {
    return {
      success: false,
      message: "No .agents/skills folder in this workspace. Run \"Apply workflow for Codex\" first to generate it.",
      details: [skillsSrc],
    };
  }

  const codexSkillsRoot = path.join(os.homedir(), ".codex", "skills");
  const installed: string[] = [];
  const skipped: string[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(skillsSrc, { withFileTypes: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to read .agents/skills: ${message}`,
    };
  }

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const skillPath = path.join(skillsSrc, e.name);
    const skillMdPath = path.join(skillPath, "SKILL.md");
    if (!fs.existsSync(skillMdPath)) {
      skipped.push(e.name);
      continue;
    }
    const destPath = path.join(codexSkillsRoot, e.name);
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
      message: "No skill folders found in .agents/skills.",
      details: [skillsSrc],
      installed: [],
      skipped: [],
    };
  }

  const details: string[] = [
    `Installed to ${codexSkillsRoot}`,
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
