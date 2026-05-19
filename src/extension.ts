import * as vscode from "vscode";
import {
  getAdapters,
  getAdapter,
  recommendAssistant,
  detectAvailableAssistants,
  removeWorkflowAll,
  type AIAssistant,
} from "./adapters";
import { installCodexSkills } from "./installCodexSkills";
import { getAppliedWorkflowLog } from "./workflowManifest";

export function activate(context: vscode.ExtensionContext): void {
  const basePath = context.extensionPath;

  const openGuide = vscode.commands.registerCommand(
    "plan-code-review-workflow.openGuide",
    () => {
      const uri = vscode.Uri.joinPath(vscode.Uri.file(basePath), "README.md");
      vscode.workspace.openTextDocument(uri).then((doc) => {
        vscode.window.showTextDocument(doc, { preview: false });
      });
    },
  );

  const openPublishing = vscode.commands.registerCommand(
    "plan-code-review-workflow.openPublishing",
    () => {
      const uri = vscode.Uri.joinPath(
        vscode.Uri.file(basePath),
        "PUBLISHING.md",
      );
      vscode.workspace.openTextDocument(uri).then((doc) => {
        vscode.window.showTextDocument(doc, { preview: false });
      });
    },
  );

  const openDevGuide = vscode.commands.registerCommand(
    "plan-code-review-workflow.openDevGuide",
    () => {
      const uri = vscode.Uri.joinPath(
        vscode.Uri.file(basePath),
        "DEV-GUIDE.md",
      );
      vscode.workspace.openTextDocument(uri).then((doc) => {
        vscode.window.showTextDocument(doc, { preview: false });
      });
    },
  );

  const workspaceRootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const adapterContext = {
    extensionPath: basePath,
    workspaceRootPath,
  };

  /** Show picker for Claude install location; returns undefined if cancelled. */
  async function pickClaudeInstallTarget(): Promise<
    "project" | "user" | undefined
  > {
    const choice = await vscode.window.showQuickPick(
      [
        {
          label: "Project root",
          description: ".claude in this workspace",
          detail: "Apply to the current project only",
          target: "project" as const,
        },
        {
          label: "User directory (~/.claude)",
          description: "Apply to all projects",
          detail: "Install once, use in every project",
          target: "user" as const,
        },
      ],
      {
        title: "Where should the Claude workflow be installed?",
        matchOnDescription: true,
      },
    );
    return choice?.target;
  }

  /** Show picker for Codex install location; returns undefined if cancelled. */
  async function pickCodexInstallTarget(): Promise<
    "project" | "user" | undefined
  > {
    const choice = await vscode.window.showQuickPick(
      [
        {
          label: "Project root",
          description: "AGENTS.md in this workspace",
          detail: "Apply to the current project only",
          target: "project" as const,
        },
        {
          label: "User directory (~/.codex)",
          description: "AGENTS.md, rules, and skills in ~/.codex",
          detail: "Install once, use in every project",
          target: "user" as const,
        },
      ],
      {
        title: "Where should the Codex workflow be installed?",
        matchOnDescription: true,
      },
    );
    return choice?.target;
  }

  /** Show picker for Cursor install location; returns undefined if cancelled. */
  async function pickCursorInstallTarget(): Promise<
    "project" | "user" | undefined
  > {
    const choice = await vscode.window.showQuickPick(
      [
        {
          label: "Project root",
          description: ".cursor in this workspace",
          detail: "Apply to the current project only",
          target: "project" as const,
        },
        {
          label: "User directory (~/.cursor)",
          description: "Apply to all projects",
          detail: "Install once, use in every project",
          target: "user" as const,
        },
      ],
      {
        title: "Where should the Cursor workflow be installed?",
        matchOnDescription: true,
      },
    );
    return choice?.target;
  }

  function applyAndNotify(
    adapterId: AIAssistant,
    claudeTarget?: "project" | "user",
    cursorTarget?: "project" | "user",
    codexTarget?: "project" | "user",
  ): void {
    const adapter = getAdapter(adapterId);
    if (!adapter) {
      vscode.window.showErrorMessage(`Unknown assistant: ${adapterId}`);
      return;
    }
    const ctx = {
      ...adapterContext,
      workspaceRootPath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
      ...(adapterId === "claude" &&
        claudeTarget !== undefined && { claudeInstallTarget: claudeTarget }),
      ...(adapterId === "cursor" &&
        cursorTarget !== undefined && { cursorInstallTarget: cursorTarget }),
      ...(adapterId === "codex" &&
        codexTarget !== undefined && { codexInstallTarget: codexTarget }),
    };
    adapter.apply(ctx).then((result) => {
      if (result.success) {
        const detail = result.details?.length
          ? "\n" + result.details.join("\n")
          : "";
        vscode.window.showInformationMessage(result.message + detail, {
          modal: false,
        });
      } else {
        vscode.window.showErrorMessage(result.message);
      }
    });
  }

  const applyWorkflowCurrent = vscode.commands.registerCommand(
    "plan-code-review-workflow.applyWorkflowCurrent",
    async () => {
      const recommended = recommendAssistant();
      if (!recommended) {
        vscode.window.showWarningMessage(
          "No supported AI assistant detected. Install Claude Code, GitHub Copilot, or Codex, or use this command in Cursor.",
        );
        return;
      }
      if (recommended === "claude") {
        const target = await pickClaudeInstallTarget();
        if (target === undefined) return;
        applyAndNotify("claude", target);
      } else if (recommended === "cursor") {
        const target = await pickCursorInstallTarget();
        if (target === undefined) return;
        applyAndNotify("cursor", undefined, target);
      } else if (recommended === "codex") {
        const target = await pickCodexInstallTarget();
        if (target === undefined) return;
        applyAndNotify("codex", undefined, undefined, target);
      } else {
        applyAndNotify(recommended);
      }
    },
  );

  const applyWorkflowPick = vscode.commands.registerCommand(
    "plan-code-review-workflow.applyWorkflowPick",
    async () => {
      const available = detectAvailableAssistants();
      const adapters = getAdapters();
      const items: vscode.QuickPickItem[] = adapters.map((a) => ({
        label: a.name,
        description: a.description,
        detail: available.includes(a.id) ? "Available" : undefined,
      }));
      const picked = await vscode.window.showQuickPick(items, {
        title: "Apply workflow for",
        matchOnDescription: true,
      });
      if (!picked) return;
      const adapter = adapters.find((a) => a.name === picked.label);
      if (!adapter) return;
      if (adapter.id === "claude") {
        const target = await pickClaudeInstallTarget();
        if (target === undefined) return;
        applyAndNotify("claude", target);
      } else if (adapter.id === "cursor") {
        const target = await pickCursorInstallTarget();
        if (target === undefined) return;
        applyAndNotify("cursor", undefined, target);
      } else if (adapter.id === "codex") {
        const target = await pickCodexInstallTarget();
        if (target === undefined) return;
        applyAndNotify("codex", undefined, undefined, target);
      } else {
        applyAndNotify(adapter.id);
      }
    },
  );

  const applyWorkflowCursor = vscode.commands.registerCommand(
    "plan-code-review-workflow.applyWorkflowCursor",
    async () => {
      const target = await pickCursorInstallTarget();
      if (target === undefined) return;
      applyAndNotify("cursor", undefined, target);
    },
  );
  const applyWorkflowClaude = vscode.commands.registerCommand(
    "plan-code-review-workflow.applyWorkflowClaude",
    async () => {
      const target = await pickClaudeInstallTarget();
      if (target === undefined) return;
      applyAndNotify("claude", target);
    },
  );
  const applyWorkflowCopilot = vscode.commands.registerCommand(
    "plan-code-review-workflow.applyWorkflowCopilot",
    () => applyAndNotify("copilot"),
  );
  const applyWorkflowCodex = vscode.commands.registerCommand(
    "plan-code-review-workflow.applyWorkflowCodex",
    async () => {
      const target = await pickCodexInstallTarget();
      if (target === undefined) return;
      applyAndNotify("codex", undefined, undefined, target);
    },
  );

  const installCodexSkillsCmd = vscode.commands.registerCommand(
    "plan-code-review-workflow.installCodexSkills",
    () => {
      const workspaceRootPath =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const result = installCodexSkills(workspaceRootPath, basePath);
      if (result.success) {
        const detail = result.details?.length
          ? "\n" + result.details.join("\n")
          : "";
        vscode.window.showInformationMessage(result.message + detail, {
          modal: false,
        });
      } else {
        vscode.window.showErrorMessage(result.message);
      }
    },
  );

  const removeWorkflowAllCmd = vscode.commands.registerCommand(
    "plan-code-review-workflow.removeWorkflowAll",
    async () => {
      const confirm = await vscode.window.showWarningMessage(
        "Remove only the workflow items that this extension added (recorded in the manifest). Other commands/skills/rules will not be touched. Continue?",
        { modal: true },
        "Remove extension workflow only",
      );
      if (confirm !== "Remove extension workflow only") return;
      const workspaceRootPath =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const result = await removeWorkflowAll({
        extensionPath: basePath,
        workspaceRootPath,
      });
      if (result.success) {
        const detail = result.details?.length
          ? "\n" + result.details.join("\n")
          : "";
        vscode.window.showInformationMessage(result.message + detail, {
          modal: false,
        });
      } else {
        vscode.window.showErrorMessage(result.message);
      }
    },
  );

  const showAppliedWorkflowLogCmd = vscode.commands.registerCommand(
    "plan-code-review-workflow.showAppliedWorkflowLog",
    () => {
      const workspaceRootPath =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const { summary, workspace, user } =
        getAppliedWorkflowLog(workspaceRootPath);
      const lines: string[] = [
        'Plan-Code-Review Workflow — Applied items (only these are removed by "Remove workflow from all")',
        "",
        ...summary,
      ];
      if (workspace || user) {
        lines.push("", "---", "Raw manifest (workspace):");
        lines.push(workspace ? JSON.stringify(workspace, null, 2) : "(none)");
        lines.push("", "Raw manifest (user):");
        lines.push(user ? JSON.stringify(user, null, 2) : "(none)");
      }
      const content = lines.join("\n");
      vscode.workspace
        .openTextDocument({ content, language: "plaintext" })
        .then((document) => {
          vscode.window.showTextDocument(document, { preview: false });
        });
    },
  );

  context.subscriptions.push(
    openGuide,
    openPublishing,
    openDevGuide,
    applyWorkflowCurrent,
    applyWorkflowPick,
    applyWorkflowCursor,
    applyWorkflowClaude,
    applyWorkflowCopilot,
    applyWorkflowCodex,
    installCodexSkillsCmd,
    removeWorkflowAllCmd,
    showAppliedWorkflowLogCmd,
  );
}

export function deactivate(): void {}
