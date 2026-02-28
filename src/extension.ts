import * as vscode from "vscode";

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

  context.subscriptions.push(openGuide, openPublishing);
}

export function deactivate(): void {}
