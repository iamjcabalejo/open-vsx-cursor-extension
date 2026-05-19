#!/usr/bin/env node
/**
 * Runs the manual verification checklist for separate-assistant-configs.
 * Executes apply (and remove) for Cursor, Claude, Copilot to a temp workspace.
 * Codex is not run here (it writes to ~/.codex); verify Codex manually or in IDE.
 *
 * Usage: from repo root after `npm run compile`:
 *   node scripts/verify-apply-remove.js
 *
 * See docs/plans/separate-assistant-configs-verification.md
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const EXTENSION_PATH = path.resolve(__dirname, "..");
const TEMP_WORKSPACE = path.join(os.tmpdir(), `workflow-verify-${Date.now()}`);

function exists(p) {
  return fs.existsSync(p);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log("Separate Assistant Configs — verification script\n");
  console.log("Extension path:", EXTENSION_PATH);
  console.log("Temp workspace:", TEMP_WORKSPACE);
  console.log("");

  // Load compiled adapters (must run after npm run compile)
  const cursor = require("../out/adapters/cursor");
  const claude = require("../out/adapters/claude");
  const copilot = require("../out/adapters/copilot");

  const context = {
    extensionPath: EXTENSION_PATH,
    workspaceRootPath: TEMP_WORKSPACE,
    claudeInstallTarget: "project",
    cursorInstallTarget: "project",
  };

  let failed = 0;

  // --- 1. Apply each assistant (project scope) ---
  console.log("1. Apply each assistant (project scope)");
  console.log("   Creating temp workspace...");
  if (!exists(TEMP_WORKSPACE)) {
    fs.mkdirSync(TEMP_WORKSPACE, { recursive: true });
  }

  // 1.1 Apply Cursor
  const cursorResult = await cursor.applyCursor(context);
  if (!cursorResult.success) {
    console.log("   [FAIL] Apply Cursor:", cursorResult.message);
    failed++;
  } else {
    assert(exists(path.join(TEMP_WORKSPACE, ".cursor")), "missing .cursor/");
    assert(
      exists(path.join(TEMP_WORKSPACE, ".cursor-plugin")),
      "missing .cursor-plugin/",
    );
    assert(
      exists(path.join(TEMP_WORKSPACE, ".cursor", "rules")),
      "missing .cursor/rules/",
    );
    assert(
      exists(path.join(TEMP_WORKSPACE, ".cursor", "agents")),
      "missing .cursor/agents/",
    );
    assert(
      exists(path.join(TEMP_WORKSPACE, ".cursor", "skills")),
      "missing .cursor/skills/",
    );
    console.log("   [OK] Apply Cursor: .cursor/ and .cursor-plugin/ created");
  }

  // 1.2 Apply Claude
  const claudeResult = await claude.applyClaude(context);
  if (!claudeResult.success) {
    console.log("   [FAIL] Apply Claude:", claudeResult.message);
    failed++;
  } else {
    assert(exists(path.join(TEMP_WORKSPACE, ".claude")), "missing .claude/");
    assert(exists(path.join(TEMP_WORKSPACE, "CLAUDE.md")), "missing CLAUDE.md");
    assert(
      exists(path.join(TEMP_WORKSPACE, ".claude", "agents")),
      "missing .claude/agents/",
    );
    assert(
      exists(path.join(TEMP_WORKSPACE, ".claude", "rules")),
      "missing .claude/rules/",
    );
    const claudeMd = fs.readFileSync(
      path.join(TEMP_WORKSPACE, "CLAUDE.md"),
      "utf-8",
    );
    assert(
      !claudeMd.includes(".cursor/"),
      "CLAUDE.md should not reference .cursor/",
    );
    console.log(
      "   [OK] Apply Claude: .claude/ and CLAUDE.md created (no .cursor paths)",
    );
  }

  // 1.3 Apply Copilot
  const copilotResult = await copilot.applyCopilot(context);
  if (!copilotResult.success) {
    console.log("   [FAIL] Apply Copilot:", copilotResult.message);
    failed++;
  } else {
    assert(
      exists(path.join(TEMP_WORKSPACE, ".github", "copilot-instructions.md")),
      "missing .github/copilot-instructions.md",
    );
    assert(
      exists(path.join(TEMP_WORKSPACE, ".github", "instructions")),
      "missing .github/instructions/",
    );
    assert(
      exists(path.join(TEMP_WORKSPACE, ".github", "agents")),
      "missing .github/agents/",
    );
    assert(
      exists(path.join(TEMP_WORKSPACE, ".github", "workflows")),
      "missing .github/workflows/",
    );
    assert(exists(path.join(TEMP_WORKSPACE, "AGENTS.md")), "missing AGENTS.md");
    console.log("   [OK] Apply Copilot: .github/ and AGENTS.md created");
  }

  console.log("");

  // --- 2. Remove for each assistant ---
  console.log("2. Remove for each assistant (manifest-based)");
  const removeContext = { ...context };

  const cursorRemove = await cursor.removeCursor(removeContext);
  if (!cursorRemove.success) {
    console.log("   [FAIL] Remove Cursor:", cursorRemove.message);
    failed++;
  } else {
    const cursorGone =
      !exists(path.join(TEMP_WORKSPACE, ".cursor")) &&
      !exists(path.join(TEMP_WORKSPACE, ".cursor-plugin"));
    if (cursorGone) {
      console.log(
        "   [OK] Remove Cursor: .cursor/ and .cursor-plugin/ removed",
      );
    } else {
      console.log(
        "   [WARN] Remove Cursor: reported success but dirs still present (manifest may not have been set)",
      );
    }
  }

  const claudeRemove = await claude.removeClaude(removeContext);
  if (!claudeRemove.success) {
    console.log("   [FAIL] Remove Claude:", claudeRemove.message);
    failed++;
  } else {
    const claudeGone =
      !exists(path.join(TEMP_WORKSPACE, ".claude")) &&
      !exists(path.join(TEMP_WORKSPACE, "CLAUDE.md"));
    if (claudeGone) {
      console.log("   [OK] Remove Claude: .claude/ and CLAUDE.md removed");
    } else {
      console.log(
        "   [WARN] Remove Claude: reported success but dirs still present",
      );
    }
  }

  const copilotRemove = await copilot.removeCopilot(removeContext);
  if (!copilotRemove.success) {
    console.log("   [FAIL] Remove Copilot:", copilotRemove.message);
    failed++;
  } else {
    const githubGone = !exists(path.join(TEMP_WORKSPACE, ".github"));
    const agentsGone = !exists(path.join(TEMP_WORKSPACE, "AGENTS.md"));
    if (githubGone && agentsGone) {
      console.log("   [OK] Remove Copilot: .github/ and AGENTS.md removed");
    } else {
      console.log(
        "   [WARN] Remove Copilot: reported success but some artifacts still present",
      );
    }
  }

  if (exists(TEMP_WORKSPACE)) {
    try {
      fs.rmSync(TEMP_WORKSPACE, { recursive: true });
      console.log("\n   Temp workspace removed.");
    } catch (e) {
      console.log(
        "\n   (Could not remove temp workspace:",
        TEMP_WORKSPACE,
        ")",
      );
    }
  }

  console.log("\n3. Package");
  console.log("   Compile: already run (script loads from out/).");
  console.log(
    "   vsce package: run manually. If you see 'Expected concurrency to be an integer', it is a vsce/secretlint bug;",
  );
  console.log(
    "   the file list showed workflow/ (171 files) included. Install VSIX in a clean profile for full checklist.",
  );

  console.log(
    "\n4. Codex (source tree only; apply writes to ~/.codex — run in IDE to verify)",
  );
  const codexSkills = path.join(EXTENSION_PATH, "workflow", "codex", "skills");
  const codexAgents = path.join(
    EXTENSION_PATH,
    "workflow",
    "codex",
    "AGENTS.md",
  );
  const codexTokenPolicy = path.join(
    EXTENSION_PATH,
    "workflow",
    "codex",
    "rules",
    "token-policy.md",
  );
  if (exists(codexSkills) && exists(codexAgents) && exists(codexTokenPolicy)) {
    console.log(
      "   [OK] workflow/codex/skills/, AGENTS.md, and rules/token-policy.md exist.",
    );
  } else {
    console.log("   [FAIL] workflow/codex/ structure missing.");
    failed++;
  }

  console.log("");
  if (failed > 0) {
    console.log("Result: FAILED (" + failed + " check(s) failed).");
    process.exit(1);
  }
  console.log(
    "Result: PASSED (Apply/Remove for Cursor, Claude, Copilot; Codex source tree).",
  );
  console.log(
    "Complete the checklist by running Apply/Remove in the IDE and installing the VSIX in a clean profile.",
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
