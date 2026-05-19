import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { AdapterContext, ApplyResult, RemoveResult } from "./types";
import { getWorkflowSourceRoot } from "../workflowPaths";
import {
  syncSkillsToCodexFromSource,
  removeCodexSkillsByNames,
} from "../installCodexSkills";
import {
  getWorkspaceManifest,
  getUserManifest,
  recordWorkspaceApplied,
  recordUserApplied,
  clearWorkspaceManifest,
  clearUserManifest,
} from "../workflowManifest";

const SKIP_DIRS = new Set([".git", "node_modules", ".vscode-test"]);

function copyDirRecursive(srcDir: string, destDir: string): void {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const e of fs.readdirSync(srcDir, { withFileTypes: true })) {
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
 * Apply workflow for Codex.
 * - **project:** workspace `AGENTS.md` only (current project).
 * - **user:** `~/.codex/AGENTS.md`, `~/.codex/rules/`, and `~/.codex/skills/` (all projects).
 */
export async function applyCodex(
  context: AdapterContext,
): Promise<ApplyResult> {
  const {
    extensionPath,
    workspaceRootPath,
    codexInstallTarget = "project",
  } = context;
  const isUser = codexInstallTarget === "user";

  if (!isUser && !workspaceRootPath) {
    return {
      success: false,
      message:
        "No workspace folder open. Open a folder first, then run the command again.",
    };
  }

  const codexSrc = getWorkflowSourceRoot(extensionPath, "codex");
  const skillsSrc = path.join(codexSrc, "skills");
  if (!fs.existsSync(skillsSrc)) {
    return {
      success: false,
      message: "Extension workflow files not found. Reinstall the extension.",
    };
  }

  const details: string[] = [];
  try {
    if (isUser) {
      const syncResult = syncSkillsToCodexFromSource(skillsSrc);
      if (!syncResult.success) {
        return {
          success: false,
          message: syncResult.message,
          details: syncResult.details,
        };
      }
      details.push("~/.codex/skills/ (synced from workflow/codex/skills)");
      const installedNames = syncResult.installed ?? [];
      if (installedNames.length > 0) {
        details.push(`Added ${installedNames.length} skill(s):`);
        for (const name of installedNames) {
          details.push(`  - ${name}`);
        }
      }
      if ((syncResult.skipped?.length ?? 0) > 0) {
        details.push(
          "Skipped (no SKILL.md): " + (syncResult.skipped ?? []).join(", "),
        );
      }

      const codexUserDir = path.join(os.homedir(), ".codex");
      if (!fs.existsSync(codexUserDir))
        fs.mkdirSync(codexUserDir, { recursive: true });

      const userAgentsSrc = path.join(codexSrc, "user", "AGENTS.md");
      const userAgentsPath = path.join(codexUserDir, "AGENTS.md");
      if (fs.existsSync(userAgentsSrc)) {
        fs.copyFileSync(userAgentsSrc, userAgentsPath);
        details.push(
          "~/.codex/AGENTS.md (compounding dev cycle + token policy)",
        );
      }

      const rulesSrc = path.join(codexSrc, "rules");
      if (fs.existsSync(rulesSrc)) {
        copyDirRecursive(rulesSrc, path.join(codexUserDir, "rules"));
        details.push("~/.codex/rules/ (token-policy.md)");
      }

      recordUserApplied({
        codex: {
          skills: syncResult.installed ?? [],
          userAgents: true,
          appliedAt: new Date().toISOString(),
        },
      });

      return {
        success: true,
        message: "Codex workflow applied to ~/.codex/ (all projects).",
        details,
      };
    }

    const workspaceAgentsSrc = path.join(codexSrc, "AGENTS.md");
    const agentsMdPath = path.join(workspaceRootPath!, "AGENTS.md");
    if (fs.existsSync(workspaceAgentsSrc)) {
      fs.copyFileSync(workspaceAgentsSrc, agentsMdPath);
      details.push("AGENTS.md in workspace (rules + agent summaries)");
    }

    recordWorkspaceApplied(workspaceRootPath!, {
      codex: { workspaceAgents: true, appliedAt: new Date().toISOString() },
    });

    return {
      success: true,
      message: "Codex workflow applied to this workspace (AGENTS.md).",
      details,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to apply Codex workflow: ${message}`,
      details,
    };
  }
}

const CODEX_AGENTS_MARKER = "Plan-Code-Review workflow";

/**
 * Remove Codex workflow only from locations recorded in the manifest (extension-added only).
 */
export async function removeCodex(
  context: AdapterContext,
): Promise<RemoveResult> {
  const { workspaceRootPath } = context;
  const details: string[] = [];
  const errors: string[] = [];
  const workspaceManifest = getWorkspaceManifest(workspaceRootPath);
  const userManifest = getUserManifest();

  const skillsToRemove = userManifest?.codex?.skills;
  let skillsRemovedCount = 0;
  if (skillsToRemove?.length) {
    const skillsResult = removeCodexSkillsByNames(skillsToRemove);
    if (!skillsResult.success) {
      return {
        success: false,
        message: skillsResult.message,
        details: skillsResult.details,
      };
    }
    const skillDetails = skillsResult.details ?? [];
    if (skillDetails.length) details.push(...skillDetails);
    skillsRemovedCount = skillsResult.installed?.length ?? 0;
  }

  if (userManifest?.codex?.userAgents) {
    const codexUserDir = path.join(os.homedir(), ".codex");
    const userAgentsPath = path.join(codexUserDir, "AGENTS.md");
    if (fs.existsSync(userAgentsPath)) {
      try {
        const content = fs.readFileSync(userAgentsPath, "utf-8");
        if (content.includes(CODEX_AGENTS_MARKER)) {
          fs.unlinkSync(userAgentsPath);
          details.push("Removed ~/.codex/AGENTS.md");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${userAgentsPath}: ${message}`);
      }
    }
    const tokenPolicyPath = path.join(codexUserDir, "rules", "token-policy.md");
    if (fs.existsSync(tokenPolicyPath)) {
      try {
        const ruleContent = fs.readFileSync(tokenPolicyPath, "utf-8");
        if (ruleContent.includes("# TokenPolicy")) {
          fs.unlinkSync(tokenPolicyPath);
          details.push("Removed ~/.codex/rules/token-policy.md");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${tokenPolicyPath}: ${message}`);
      }
    }
  }
  if (userManifest?.codex) {
    clearUserManifest(["codex"]);
  }

  if (workspaceRootPath && workspaceManifest?.codex) {
    const agentsPath = path.join(workspaceRootPath, "AGENTS.md");
    if (fs.existsSync(agentsPath)) {
      try {
        const content = fs.readFileSync(agentsPath, "utf-8");
        if (content.includes(CODEX_AGENTS_MARKER)) {
          fs.unlinkSync(agentsPath);
          details.push("Removed workspace AGENTS.md");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${agentsPath}: ${message}`);
      }
    }
    clearWorkspaceManifest(workspaceRootPath, ["codex"]);
  }

  if (errors.length > 0) {
    return {
      success: false,
      message:
        "Failed to remove some Codex workflow files: " + errors.join("; "),
      details,
    };
  }
  const removed = details.length > 0 || skillsRemovedCount > 0;
  return {
    success: true,
    message: removed
      ? "Codex workflow removed from recorded locations only."
      : "No Codex workflow applied by this extension (nothing to remove).",
    details: details.length > 0 ? details : undefined,
  };
}
