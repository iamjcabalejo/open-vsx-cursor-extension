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

const INSTRUCTIONS_FILE_NAME = "plan-code-review-workflow.instructions.md";
const SKIP_DIRS = new Set([".git", "node_modules", ".vscode-test"]);

/** Recursively copy directory contents to dest, creating subdirs. Returns relative paths written (under destDir). */
function copyDirRecursive(
  srcDir: string,
  destDir: string,
  relPrefix: string,
): string[] {
  const written: string[] = [];
  if (!fs.existsSync(srcDir)) return written;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(srcDir, e.name);
    const destPath = path.join(destDir, e.name);
    const rel = path.join(relPrefix, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      written.push(...copyDirRecursive(srcPath, destPath, rel));
    } else {
      fs.copyFileSync(srcPath, destPath);
      written.push(rel);
    }
  }
  return written;
}

/** User-level prompts directories for GitHub Copilot / VS Code (Code and Cursor). */
function getUserPromptsDirs(): string[] {
  const home = os.homedir();
  const dirs: string[] = [];
  if (process.platform === "darwin") {
    dirs.push(
      path.join(
        home,
        "Library",
        "Application Support",
        "Code",
        "User",
        "prompts",
      ),
    );
    dirs.push(
      path.join(
        home,
        "Library",
        "Application Support",
        "Cursor",
        "User",
        "prompts",
      ),
    );
  } else if (process.platform === "win32") {
    const appData =
      process.env.APPDATA || path.join(home, "AppData", "Roaming");
    dirs.push(path.join(appData, "Code", "User", "prompts"));
    dirs.push(path.join(appData, "Cursor", "User", "prompts"));
  } else {
    dirs.push(path.join(home, ".config", "Code", "User", "prompts"));
    dirs.push(path.join(home, ".config", "Cursor", "User", "prompts"));
  }
  return dirs;
}

/**
 * Apply workflow for GitHub Copilot: copy from workflow/copilot to .github/ and root AGENTS.md; user-level from copilot/user-instructions.md.
 */
export async function applyCopilot(
  context: AdapterContext,
): Promise<ApplyResult> {
  const { extensionPath, workspaceRootPath } = context;
  if (!workspaceRootPath) {
    return {
      success: false,
      message:
        "No workspace folder open. Open a folder first, then run the command again.",
    };
  }

  const copilotSrc = getWorkflowSourceRoot(extensionPath, "copilot");
  if (!fs.existsSync(copilotSrc)) {
    return {
      success: false,
      message:
        "Extension workflow files not found. Ensure the extension was installed from a package that includes workflow/copilot.",
    };
  }

  const details: string[] = [];
  const copilotFiles: string[] = [];

  try {
    const githubDir = path.join(workspaceRootPath, ".github");
    if (!fs.existsSync(githubDir)) fs.mkdirSync(githubDir, { recursive: true });

    const copilotInstructionsSrc = path.join(
      copilotSrc,
      "copilot-instructions.md",
    );
    if (fs.existsSync(copilotInstructionsSrc)) {
      const dest = path.join(githubDir, "copilot-instructions.md");
      fs.copyFileSync(copilotInstructionsSrc, dest);
      copilotFiles.push(".github/copilot-instructions.md");
      details.push(".github/copilot-instructions.md");
    }

    const instructionsSrc = path.join(copilotSrc, "instructions");
    if (fs.existsSync(instructionsSrc)) {
      const instructionsDest = path.join(githubDir, "instructions");
      const relPaths = copyDirRecursive(
        instructionsSrc,
        instructionsDest,
        ".github/instructions",
      );
      copilotFiles.push(...relPaths);
      if (relPaths.length > 0) {
        details.push(
          ".github/instructions/ (token-policy + compounding-dev-cycle.instructions.md)",
        );
      }
    }

    const agentsSrc = path.join(copilotSrc, "agents");
    if (fs.existsSync(agentsSrc)) {
      const agentsDest = path.join(githubDir, "agents");
      const relPaths = copyDirRecursive(
        agentsSrc,
        agentsDest,
        ".github/agents",
      );
      copilotFiles.push(...relPaths);
      if (relPaths.length > 0)
        details.push(
          ".github/agents/ (" +
            relPaths.length +
            " agent(s) as <name>.agent.md)",
        );
    }

    const workflowsSrc = path.join(copilotSrc, "workflows");
    if (fs.existsSync(workflowsSrc)) {
      const workflowsDest = path.join(githubDir, "workflows");
      const relPaths = copyDirRecursive(
        workflowsSrc,
        workflowsDest,
        ".github/workflows",
      );
      copilotFiles.push(...relPaths);
      if (relPaths.length > 0)
        details.push(".github/workflows/ (hooks.json, README, scripts)");
    }

    const issueTemplateSrc = path.join(copilotSrc, "ISSUE_TEMPLATE");
    if (fs.existsSync(issueTemplateSrc)) {
      const templateDest = path.join(githubDir, "ISSUE_TEMPLATE");
      const relPaths = copyDirRecursive(
        issueTemplateSrc,
        templateDest,
        ".github/ISSUE_TEMPLATE",
      );
      copilotFiles.push(...relPaths);
      if (relPaths.length > 0)
        details.push(
          ".github/ISSUE_TEMPLATE/ (" +
            relPaths.length +
            " structured prompt(s))",
        );
    }

    const agentsMdSrc = path.join(copilotSrc, "AGENTS.md");
    if (fs.existsSync(agentsMdSrc)) {
      const agentsMdDest = path.join(workspaceRootPath, "AGENTS.md");
      fs.copyFileSync(agentsMdSrc, agentsMdDest);
      copilotFiles.push("AGENTS.md");
      details.push(
        "AGENTS.md (compounding dev cycle + custom agents in .github/agents/)",
      );
    }

    const userInstructionsSrc = path.join(copilotSrc, "user-instructions.md");
    let userLevelWritten = 0;
    const writtenPromptPaths: string[] = [];
    if (fs.existsSync(userInstructionsSrc)) {
      const userContent = fs.readFileSync(userInstructionsSrc, "utf-8");
      const instructionsContent = [
        "---",
        "name: 'Plan-Code-Review Workflow (rules, agents, skills)'",
        "description: 'Plan → Code → Review/Test cycle, rules, agent roles, and skills'",
        'applyTo: "**"',
        "---",
        "",
        userContent,
      ].join("\n");
      for (const promptsDir of getUserPromptsDirs()) {
        try {
          if (!fs.existsSync(promptsDir))
            fs.mkdirSync(promptsDir, { recursive: true });
          const filePath = path.join(promptsDir, INSTRUCTIONS_FILE_NAME);
          fs.writeFileSync(filePath, instructionsContent, "utf-8");
          writtenPromptPaths.push(filePath);
          userLevelWritten++;
        } catch (err) {
          console.warn(
            "Copilot adapter: skip prompts dir (unwritable or not used by this IDE)",
            promptsDir,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
      if (userLevelWritten > 0) {
        recordUserApplied({
          copilot: {
            promptPaths: writtenPromptPaths,
            appliedAt: new Date().toISOString(),
          },
        });
        details.push(
          `User-level: rules, agents, skills in prompts folder (${userLevelWritten} location(s))`,
        );
      }
    }

    recordWorkspaceApplied(workspaceRootPath, {
      copilot: { files: copilotFiles, appliedAt: new Date().toISOString() },
    });

    return {
      success: true,
      message:
        "GitHub Copilot workflow applied: .github/ (agents, copilot-instructions.md, workflows/hooks, ISSUE_TEMPLATE) + AGENTS.md.",
      details,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to apply Copilot workflow: ${message}`,
      details,
    };
  }
}

/**
 * Remove GitHub Copilot workflow only from paths recorded in the manifest (extension-added only).
 */
export async function removeCopilot(
  context: AdapterContext,
): Promise<RemoveResult> {
  const { workspaceRootPath } = context;
  const details: string[] = [];
  const errors: string[] = [];
  const workspaceManifest = getWorkspaceManifest(workspaceRootPath);
  const userManifest = getUserManifest();

  if (userManifest?.copilot?.promptPaths?.length) {
    for (const filePath of userManifest.copilot.promptPaths) {
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
    clearUserManifest(["copilot"]);
  }

  if (workspaceRootPath && workspaceManifest?.copilot?.files?.length) {
    for (const rel of workspaceManifest.copilot.files) {
      const filePath = path.join(workspaceRootPath, rel);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          details.push(`Removed ${rel}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(`${rel}: ${message}`);
        }
      }
    }
    const githubAgentsDir = path.join(workspaceRootPath, ".github", "agents");
    const githubWorkflowsDir = path.join(
      workspaceRootPath,
      ".github",
      "workflows",
    );
    const githubInstructionsDir = path.join(
      workspaceRootPath,
      ".github",
      "instructions",
    );
    const githubIssueTemplateDir = path.join(
      workspaceRootPath,
      ".github",
      "ISSUE_TEMPLATE",
    );
    for (const dir of [
      githubAgentsDir,
      githubWorkflowsDir,
      githubInstructionsDir,
      githubIssueTemplateDir,
    ]) {
      if (fs.existsSync(dir)) {
        try {
          const remaining = fs.readdirSync(dir);
          if (remaining.length === 0) {
            fs.rmdirSync(dir);
            const rel = path.relative(workspaceRootPath, dir);
            details.push("Removed " + rel + "/ (was empty)");
          }
        } catch {
          // Ignore if not empty or permission issue
        }
      }
    }
    clearWorkspaceManifest(workspaceRootPath, ["copilot"]);
  }

  if (errors.length > 0) {
    return {
      success: false,
      message:
        "Failed to remove some Copilot workflow files: " + errors.join("; "),
      details,
    };
  }
  const removed = details.length > 0;
  return {
    success: true,
    message: removed
      ? "GitHub Copilot workflow removed from recorded paths only."
      : "No Copilot workflow applied by this extension (nothing to remove).",
    details: details.length > 0 ? details : undefined,
  };
}
