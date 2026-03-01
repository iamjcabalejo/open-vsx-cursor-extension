import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const MANIFEST_VERSION = 1;
const EXTENSION_ID = "plan-code-review-workflow";

/** Workspace manifest: stored in project root. Records what this extension applied to this project. */
export interface WorkspaceManifest {
  version: number;
  extensionId: string;
  /** When we applied Cursor to this project (wrote .cursor and .cursor-plugin). */
  cursor?: { appliedAt: string };
  /** When we applied Claude to this project (wrote .claude and CLAUDE.md). */
  claude?: { appliedAt: string };
  /** Workspace files we wrote for Copilot (relative paths). */
  copilot?: { files: string[]; appliedAt: string };
  /** When we wrote AGENTS.md in this workspace for Codex. */
  codex?: { workspaceAgents: true; appliedAt: string };
}

/** User manifest: stored in ~/.plan-code-review-workflow-applied.json. Records user-level applied items. */
export interface UserManifest {
  version: number;
  extensionId: string;
  cursor?: { appliedAt: string };
  claude?: { appliedAt: string };
  /** Full paths to Copilot instruction files we wrote. */
  copilot?: { promptPaths: string[]; appliedAt: string };
  /** Codex: skill names we installed and whether we wrote ~/.codex/AGENTS.md. */
  codex?: { skills: string[]; userAgents: true; appliedAt: string };
}

const WORKSPACE_MANIFEST_FILE = ".plan-code-review-workflow-applied.json";
const USER_MANIFEST_FILE = ".plan-code-review-workflow-applied.json";
const USER_MANIFEST_PATH = path.join(os.homedir(), USER_MANIFEST_FILE);

function readJsonSafe<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function workspaceManifestPath(workspaceRootPath: string): string {
  return path.join(workspaceRootPath, WORKSPACE_MANIFEST_FILE);
}

/** Read workspace manifest. Returns null if no workspace or file missing. */
export function getWorkspaceManifest(workspaceRootPath: string | undefined): WorkspaceManifest | null {
  if (!workspaceRootPath) return null;
  const p = workspaceManifestPath(workspaceRootPath);
  if (!fs.existsSync(p)) return null;
  const data = readJsonSafe<WorkspaceManifest>(p, null as unknown as WorkspaceManifest);
  if (!data || data.version !== MANIFEST_VERSION || data.extensionId !== EXTENSION_ID) return null;
  return data;
}

/** Read user manifest. */
export function getUserManifest(): UserManifest | null {
  if (!fs.existsSync(USER_MANIFEST_PATH)) return null;
  const data = readJsonSafe<UserManifest>(USER_MANIFEST_PATH, null as unknown as UserManifest);
  if (!data || data.version !== MANIFEST_VERSION || data.extensionId !== EXTENSION_ID) return null;
  return data;
}

/** Merge and write workspace manifest. */
export function recordWorkspaceApplied(
  workspaceRootPath: string,
  update: Partial<Omit<WorkspaceManifest, "version" | "extensionId">>
): void {
  const p = workspaceManifestPath(workspaceRootPath);
  const existing: WorkspaceManifest = readJsonSafe(p, {
    version: MANIFEST_VERSION,
    extensionId: EXTENSION_ID,
  } as WorkspaceManifest);
  const merged: WorkspaceManifest = {
    ...existing,
    ...update,
    version: MANIFEST_VERSION,
    extensionId: EXTENSION_ID,
  };
  fs.writeFileSync(p, JSON.stringify(merged, null, 2), "utf-8");
}

/** Merge and write user manifest. */
export function recordUserApplied(
  update: Partial<Omit<UserManifest, "version" | "extensionId">>
): void {
  const existing: UserManifest = readJsonSafe(USER_MANIFEST_PATH, {
    version: MANIFEST_VERSION,
    extensionId: EXTENSION_ID,
  } as UserManifest);
  const merged: UserManifest = {
    ...existing,
    ...update,
    version: MANIFEST_VERSION,
    extensionId: EXTENSION_ID,
  };
  const dir = path.dirname(USER_MANIFEST_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(USER_MANIFEST_PATH, JSON.stringify(merged, null, 2), "utf-8");
}

/** Clear workspace manifest entries and delete file if empty. */
export function clearWorkspaceManifest(
  workspaceRootPath: string,
  keys: (keyof Omit<WorkspaceManifest, "version" | "extensionId">)[]
): void {
  const p = workspaceManifestPath(workspaceRootPath);
  const current = getWorkspaceManifest(workspaceRootPath);
  if (!current) return;
  const next = { ...current };
  for (const k of keys) {
    delete (next as Record<string, unknown>)[k];
  }
  const { version, extensionId, ...rest } = next;
  if (Object.keys(rest).length === 0) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } else {
    fs.writeFileSync(p, JSON.stringify(next, null, 2), "utf-8");
  }
}

/** Clear user manifest entries and delete file if empty. */
export function clearUserManifest(
  keys: (keyof Omit<UserManifest, "version" | "extensionId">)[]
): void {
  const current = getUserManifest();
  if (!current) return;
  const next = { ...current };
  for (const k of keys) {
    delete (next as Record<string, unknown>)[k];
  }
  const { version, extensionId, ...rest } = next;
  if (Object.keys(rest).length === 0) {
    if (fs.existsSync(USER_MANIFEST_PATH)) fs.unlinkSync(USER_MANIFEST_PATH);
  } else {
    fs.writeFileSync(USER_MANIFEST_PATH, JSON.stringify(next, null, 2), "utf-8");
  }
}

/** Return a human-readable log of all applied workflow (workspace + user). */
export function getAppliedWorkflowLog(
  workspaceRootPath: string | undefined
): { workspace: WorkspaceManifest | null; user: UserManifest | null; summary: string[] } {
  const workspace = workspaceRootPath ? getWorkspaceManifest(workspaceRootPath) : null;
  const user = getUserManifest();
  const summary: string[] = [];

  if (workspace) {
    if (workspace.cursor) {
      summary.push(`[Workspace] Cursor: .cursor, .cursor-plugin (applied ${workspace.cursor.appliedAt})`);
    }
    if (workspace.claude) {
      summary.push(`[Workspace] Claude: .claude, CLAUDE.md (applied ${workspace.claude.appliedAt})`);
    }
    if (workspace.copilot?.files?.length) {
      summary.push(
        `[Workspace] Copilot: ${workspace.copilot.files.join(", ")} (applied ${workspace.copilot.appliedAt})`
      );
    }
    if (workspace.codex) {
      summary.push(`[Workspace] Codex: AGENTS.md (applied ${workspace.codex.appliedAt})`);
    }
  }

  if (user) {
    if (user.cursor) {
      summary.push(`[User] Cursor: ~/.cursor, ~/.cursor-plugin (applied ${user.cursor.appliedAt})`);
    }
    if (user.claude) {
      summary.push(`[User] Claude: ~/.claude (applied ${user.claude.appliedAt})`);
    }
    if (user.copilot?.promptPaths?.length) {
      summary.push(
        `[User] Copilot: ${user.copilot.promptPaths.length} prompt file(s) (applied ${user.copilot.appliedAt})`
      );
    }
    if (user.codex) {
      const parts: string[] = [];
      if (user.codex.skills?.length) parts.push(`skills: ${user.codex.skills.length}`);
      if (user.codex.userAgents) parts.push("~/.codex/AGENTS.md");
      if (parts.length) summary.push(`[User] Codex: ${parts.join(", ")} (applied ${user.codex.appliedAt})`);
    }
  }

  if (summary.length === 0) {
    summary.push("No workflow applied by this extension (no manifest found).");
  }

  return { workspace, user, summary };
}
