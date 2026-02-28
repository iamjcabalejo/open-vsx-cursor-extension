import * as vscode from "vscode";
import {
  getAdapters,
  getAdapter,
  recommendAssistant,
  detectAvailableAssistants,
  type AIAssistant,
} from "./adapters";

export function activate(context: vscode.ExtensionContext): void {
  const basePath = context.extensionPath;

  const openGuide = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.openGuide",
    () => {
      const uri = vscode.Uri.joinPath(vscode.Uri.file(basePath), "README.md");
      vscode.workspace.openTextDocument(uri).then((doc) => {
        vscode.window.showTextDocument(doc, { preview: false });
      });
    }
  );

  const openPublishing = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.openPublishing",
    () => {
      const uri = vscode.Uri.joinPath(vscode.Uri.file(basePath), "PUBLISHING.md");
      vscode.workspace.openTextDocument(uri).then((doc) => {
        vscode.window.showTextDocument(doc, { preview: false });
      });
    }
  );

  const openDevGuide = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.openDevGuide",
    () => {
      const uri = vscode.Uri.joinPath(vscode.Uri.file(basePath), "DEV-GUIDE.md");
      vscode.workspace.openTextDocument(uri).then((doc) => {
        vscode.window.showTextDocument(doc, { preview: false });
      });
    }
  );

  const workspaceRootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const adapterContext = {
    extensionPath: basePath,
    workspaceRootPath,
  };

  function applyAndNotify(adapterId: AIAssistant): void {
    const adapter = getAdapter(adapterId);
    if (!adapter) {
      vscode.window.showErrorMessage(`Unknown assistant: ${adapterId}`);
      return;
    }
    const ctx = {
      ...adapterContext,
      workspaceRootPath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
    };
    adapter.apply(ctx).then((result) => {
      if (result.success) {
        const detail = result.details?.length
          ? "\n" + result.details.join("\n")
          : "";
        vscode.window.showInformationMessage(
          result.message + detail,
          { modal: false }
        );
      } else {
        vscode.window.showErrorMessage(result.message);
      }
    });
  }

  const applyWorkflowCurrent = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.applyWorkflowCurrent",
    () => {
      const recommended = recommendAssistant();
      if (!recommended) {
        vscode.window.showWarningMessage(
          "No supported AI assistant detected. Install Claude Code, GitHub Copilot, or Codex, or use this command in Cursor."
        );
        return;
      }
      applyAndNotify(recommended);
    }
  );

  const applyWorkflowPick = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.applyWorkflowPick",
    async () => {
      const available = detectAvailableAssistants();
      const adapters = getAdapters();
      const items: vscode.QuickPickItem[] = adapters.map((a) => ({
        label: a.name,
        description: a.description,
        detail: available.includes(a.id) ? "Available" : undefined,
      }));
      const picked = await vscode.window.showQuickPick(items, {
        title: "Apply Payoy's workflow for",
        matchOnDescription: true,
      });
      if (!picked) return;
      const adapter = adapters.find((a) => a.name === picked.label);
      if (adapter) applyAndNotify(adapter.id);
    }
  );

  const applyWorkflowCursor = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.applyWorkflowCursor",
    () => applyAndNotify("cursor")
  );
  const applyWorkflowClaude = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.applyWorkflowClaude",
    () => applyAndNotify("claude")
  );
  const applyWorkflowCopilot = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.applyWorkflowCopilot",
    () => applyAndNotify("copilot")
  );
  const applyWorkflowCodex = vscode.commands.registerCommand(
    "payoys-cursor-sub-agents.applyWorkflowCodex",
    () => applyAndNotify("codex")
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
    applyWorkflowCodex
  );
}

export function deactivate(): void {}
