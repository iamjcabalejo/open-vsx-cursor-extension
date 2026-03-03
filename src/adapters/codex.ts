import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { AdapterContext, ApplyResult, RemoveResult } from "./types";
import { getWorkflowSourceRoot } from "../workflowPaths";
import { syncSkillsToCodexFromSource, removeCodexSkillsByNames } from "../installCodexSkills";
import {
  getWorkspaceManifest,
  getUserManifest,
  recordWorkspaceApplied,
  recordUserApplied,
  clearWorkspaceManifest,
  clearUserManifest,
} from "../workflowManifest";

/**
 * Apply workflow for Codex: sync workflow/codex/skills to ~/.codex/skills and write AGENTS.md from workflow/codex.
 */
export async function applyCodex(context: AdapterContext): Promise<ApplyResult> {
  const { extensionPath, workspaceRootPath } = context;
  if (!workspaceRootPath) {
    return {
      success: false,
      message: "No workspace folder open. Open a folder first, then run the command again.",
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
      details.push("Skipped (no SKILL.md): " + (syncResult.skipped ?? []).join(", "));
    }

    const codexUserDir = path.join(os.homedir(), ".codex");
    if (!fs.existsSync(codexUserDir)) fs.mkdirSync(codexUserDir, { recursive: true });

    const userAgentsSrc = path.join(codexSrc, "user", "AGENTS.md");
    const userAgentsPath = path.join(codexUserDir, "AGENTS.md");
    if (fs.existsSync(userAgentsSrc)) {
      fs.copyFileSync(userAgentsSrc, userAgentsPath);
      details.push("~/.codex/AGENTS.md (compounding dev cycle at user level)");
    }

    const workspaceAgentsSrc = path.join(codexSrc, "AGENTS.md");
    const agentsMdPath = path.join(workspaceRootPath, "AGENTS.md");
    if (fs.existsSync(workspaceAgentsSrc)) {
      fs.copyFileSync(workspaceAgentsSrc, agentsMdPath);
      details.push("AGENTS.md in workspace (rules + agent summaries)");
    }

    const skillNames = syncResult.installed ?? [];
    recordUserApplied({
      codex: {
        skills: skillNames,
        userAgents: true,
        appliedAt: new Date().toISOString(),
      },
    });
    recordWorkspaceApplied(workspaceRootPath, {
      codex: { workspaceAgents: true, appliedAt: new Date().toISOString() },
    });

    return {
      success: true,
      message:
        "Codex workflow applied: user-level compounding dev cycle + workspace AGENTS.md.",
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
 * Removes only skills that were logged when applied; never removes or replaces existing user skills.
 */
export async function removeCodex(context: AdapterContext): Promise<RemoveResult> {
  const { workspaceRootPath } = context;
  const details: string[] = [];
  const errors: string[] = [];
  const workspaceManifest = getWorkspaceManifest(workspaceRootPath);
  const userManifest = getUserManifest();

  // Remove only skills that were logged in the manifest at apply time (never touch other skills)
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
  // When there is no manifest skill list, we do not remove any skill folders:
  // we cannot know which were added by this extension vs existing user skills.

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
      message: "Failed to remove some Codex workflow files: " + errors.join("; "),
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
