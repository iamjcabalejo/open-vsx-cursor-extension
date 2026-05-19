# Plan-Code-Review Workflow

**One workflow. Four AI assistants. Token-efficient by design. Production-ready code—without the guesswork.**

Apply two **core policies**—the **compounding dev cycle** (Plan → Code → Review/Test) and the **token policy** (refine → hand off, lean context use)—to **Cursor**, **Claude Code**, **GitHub Copilot**, or **Codex**. Get a single source of truth, automatic code review, and a repeatable path from idea to shipped feature **without burning context on filler, repeated reads, or vague handoffs**.

---

## Core policies

This extension is built around two always-on rules. Every assistant gets both after you run **Apply workflow**.

| Policy                    | What it does                                                                                                                                                                  | Why it matters                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Token policy**          | **Refine → hand off** before commands, skills, or agents; concise answers; smallest useful diffs; batched reads; internal XML blueprints only for complex or high-stakes work | Context goes to **implementation and review**, not restating the ask, re-reading files, or oversized replies |
| **Compounding dev cycle** | **Plan → Code → Review/Test → Plan** with written handoffs (plan doc, implementation notes, rework list) and mode discipline (Plan / Agent / Ask)                             | One contract per feature; automatic review loop until **production ready**                                   |

**Precedence:** `token-policy` is authoritative for **how** the AI communicates and uses context. `compounding-dev-cycle` and `core-standards` reference it; stack rules (TypeScript, React, API routes, etc.) are additive. If anything conflicts, the **stricter** boundary wins (safety, secrets, data integrity).

### Token policy — always on, every assistant

After apply, each assistant loads its own canonical token rule:

| Assistant          | Token policy file                                                            |
| ------------------ | ---------------------------------------------------------------------------- |
| **Cursor**         | `.cursor/rules/token-policy.mdc` (`alwaysApply: true`)                       |
| **Claude Code**    | `.claude/rules/token-policy.md` (project or `~/.claude/rules/`)              |
| **GitHub Copilot** | `.github/instructions/token-policy.instructions.md` (`applyTo: "**"`)        |
| **Codex**          | `~/.codex/rules/token-policy.md` (user) or summarized in project `AGENTS.md` |

**Session entry flow (every phase):**

1. **Ingest** — User message plus any `@` files or selections.
2. **Refine** — One clear objective, in/out scope, constraints; for complex or ambiguous work, a short **internal XML blueprint** (role, task, forbidden, output format)—not a wall of prose.
3. **Hand off** — A tight spec to the right command, skill, or agent—not a meandering restatement.

**In practice:** Raw prompts become **prompt-shaped briefs** before `/feature-plan`, `/project-manager`, or reviewer agents run. Plans, implementation notes, and review summaries stay **lean** so the next hop does not rediscover scope.

**Also enforced:**

- **Concise, complete** answers; no filler, hedging, or engagement bait.
- **Smallest diff** that proves the change; code citations over full-file pastes.
- **Batch** reads and searches; search before full-file read when the needle is narrow.

### Why XML for complex work

Unstructured text mixes role, task, constraints, and output in one stream, so the model entangles them. **Named XML tags** carve non-overlapping slots—negative rules (`<forbidden>`, `<error_handling>`) stay as visible as positive ones, and `<analysis>` separates from `<output_format>` so the model **thinks then answers**. Use XML blueprints only when work is multi-step, ambiguous, or high-stakes; skip for trivial one-liners.

Full mechanics: see the token policy file for your assistant (table above). **Credit:** Concise-response style inspired by [Caveman SKILL.md](https://github.com/JuliusBrussee/caveman/blob/main/.cursor/skills/caveman/SKILL.md) (Julius Brussee).

---

## The compounding dev cycle

AI can write code fast—but without a clear plan and review loop, you get scope creep, untested assumptions, and “what did it actually build?” moments. The **compounding dev cycle** fixes that—and **token policy** keeps each phase’s handoffs small enough that the next agent can act without re-reading the world.

| Phase           | What happens                                                     | What you get                                                                                       |
| --------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Plan**        | One written plan: scope, acceptance criteria, technical approach | No guesswork. Code implements to the plan; review verifies against the same criteria.              |
| **Code**        | Implementation + tests + implementation notes                    | Traceability. Every change links back to the plan (e.g. “implements AC-1”).                        |
| **Review/Test** | Automatic code review (backend + frontend reviewers)             | Quality gates. Critical issues → rework plan → Code → Review again until **production ready**.     |
| **Plan (next)** | Rework or new scope becomes the next cycle                       | Clear handoffs. Written artifacts for every phase so you and the AI always have the right context. |

**In practice:** Run `/feature-plan` once → get a plan file. Run `/project-manager` with that plan → implementation runs, then **review runs automatically**. If reviewers find critical issues, the workflow re-plans, fixes, and re-reviews until the code is ready. One plan, one command, production ready.

### Modes in each assistant: Plan, Agent, and Ask

**Cursor**, **Claude Code**, and **GitHub Copilot (VS Code)** each provide Plan-, Agent-, and Ask-style modes. Align the compounding cycle—and **refine → hand off** at session start—with these native modes:

| Cycle phase     | Cursor                                         | Claude Code (VS Code)                                                                              | GitHub Copilot (VS Code)                                                                               |
| --------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Plan**        | **Plan mode** — plan only, no edits            | **Plan mode** — describes what it will do, waits for approval before changes                       | **Plan** agent — structured plan (Discovery → Alignment → Design → Refinement), then hand off to Agent |
| **Code**        | **Agent mode** — full implementation           | **Normal** or **Auto-accept** — implements with or without per-step approval                       | **Agent** — autonomously plans and implements across files, runs commands                              |
| **Review/Test** | **Ask mode** — read-only feedback, rework list | **Plan mode** or **Normal** (reject edits) — use for review-only; approve only when applying fixes | **Ask** — answers and explains without making file changes; use for review feedback                    |

**How to use:** For **Plan**, use each assistant’s Plan mode/agent so it only produces a plan (or describes steps and waits). For **Code**, use Agent (or Normal/Auto-accept in Claude). For **Review/Test**, use Ask (or Plan/Normal in Claude with “produce rework list, do not apply”) so you get a rework list without unwanted edits. Then loop: rework plan → Code again → Review again.

### How we stay token-efficient

Context goes to **shipping**, not to repeating yourself. **Token policy** (always on) and **mode discipline** (Plan / Agent / Ask) work as one system:

| Principle             | In practice                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Refine → hand off** | Before any command or agent: one objective, scope, and constraints—a **brief**, not a restatement of your message.                                                         |
| **One mode, one job** | Plan writes the plan only; Agent codes to it; Ask reviews without drive-by edits—no mixed planning + patching in one thread.                                               |
| **Written handoffs**  | Plan doc, short impl notes, and a rework list carry intent; the next phase reads the **artifact**, not the full chat.                                                      |
| **Lean execution**    | Smallest useful diffs, search-before-read, batched reads, concise replies (no filler); [XML blueprints](#why-xml-for-complex-work) only when work is complex or ambiguous. |
| **Single policy**     | One `token-policy` file per assistant; everything else references it—no duplicated “be concise” rules in every agent.                                                      |

**Codex** uses the same flow via `AGENTS.md` and skills (project or `~/.codex/`). Details: your assistant’s `token-policy` file ([Core policies](#core-policies)).

**Docs:** [Cursor modes](https://cursor.com/docs/agent/modes) · [Claude Code permission modes](https://docs.claude.com/en/docs/claude-code/vs-code) · [GitHub Copilot Chat modes](https://github.blog/ai-and-ml/github-copilot/copilot-ask-edit-and-agent-modes-what-they-do-and-when-to-use-them) · [VS Code Copilot agents](https://code.visualstudio.com/docs/copilot/chat/copilot-chat)

---

## Why install?

- **Token-efficient by default** — **Refine → hand off** before every command, skill, or agent; lean plans, diffs, and review summaries; no filler or repeated file reads. Same policy on Cursor, Claude, Copilot, and Codex.
- **No more “what did the AI build?”** — One plan doc is the contract. Code and review both use it.
- **Automatic code review** — Backend and frontend reviewers run after implementation; critical issues trigger a rework loop until gates pass.
- **Mode discipline** — Plan for planning only, Agent for implementation, Ask for review-only feedback; rules align the cycle with each assistant’s native modes.
- **Works with your stack** — Same two core policies for Cursor (slash commands), Claude Code, Copilot, or Codex; the extension installs the right files for your assistant.
- **17 agents + 19 skills** — Planning, architecture, API design, security, accessibility, E2E—all wired into the cycle and token policy.
- **Takes minutes** — Install the extension, run one “Apply workflow” command, and you’re set.

---

## Install the extension

- **VS Code:** [VS Code Marketplace](https://marketplace.visualstudio.com/) or [Open VSX](https://open-vsx.org/) — search for **Plan-Code-Review Workflow**.
- **Cursor IDE:** The Cursor plugin is not yet available in Cursor’s plugin marketplace (approval pending). **Use this instead:** install the extension in **VS Code**, open your project in VS Code, run **Plan-Code-Review: Apply workflow for Cursor**, then open the same project in Cursor—the workflow files (`.cursor/`, `.cursor-plugin/`) are in your repo and Cursor will use them. Full plugin install from Cursor’s marketplace will be available once approved.

## Apply the workflow to your project

1. Open your **project root** in **VS Code** (or in Cursor if you already have the workflow applied).
2. Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → run one of:
   - **Plan-Code-Review: Apply workflow for… (choose AI)** — pick Cursor, Claude Code, Copilot, or Codex
   - Or a specific command: **Plan-Code-Review: Apply workflow for Cursor** / **Claude Code** / **GitHub Copilot** / **Codex**

For **Cursor**, **Claude Code**, and **Codex**, you’ll be asked whether to install in the **project root** (this workspace only) or in your **user directory** (`~/.cursor/`, `~/.claude/`, or `~/.codex/`—workflow applies to all projects). **GitHub Copilot** installs workspace files plus user-level prompts for all workspaces.

**Cursor users:** Install the extension in VS Code, open your project there, run **Plan-Code-Review: Apply workflow for Cursor**, then switch to Cursor and open the same project—you get full slash commands and agents. No Cursor plugin install needed until the plugin is approved.

The extension writes the right files into your workspace. Your AI assistant loads **token policy** and the **compounding dev cycle** automatically.

### Remove the workflow

To remove **only** what this extension added (your existing commands, skills, rules, and hooks from other sources stay untouched):

- Command Palette → **Plan-Code-Review: Remove workflow from all AI assistants**

The extension keeps a manifest of what it applied (workspace and user). Remove uses that list so only extension-added items are deleted. To see exactly what’s recorded before removing:

- Command Palette → **Plan-Code-Review: Show applied workflow log**

| Assistant          | What gets created                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cursor**         | `.cursor/rules/token-policy.mdc` (**always on**), compounding cycle, core standards, agents, skills, commands, hooks                                                                                                            |
| **Claude Code**    | `.claude/rules/token-policy.md`, cycle, agents, skills, `CLAUDE.md`, hooks — project **or** `~/.claude/`                                                                                                                        |
| **GitHub Copilot** | **`.github/instructions/token-policy.instructions.md`** + **`compounding-dev-cycle.instructions.md`** (`applyTo: "**"`), **`copilot-instructions.md`**, agents, workflows, **`AGENTS.md`**; user **prompts** for all workspaces |
| **Codex**          | **Project:** workspace **`AGENTS.md`**. **User:** **`~/.codex/AGENTS.md`**, **`~/.codex/rules/token-policy.md`**, **`~/.codex/skills/`**                                                                                        |

**Codex:** Pick **project** for repo-specific rules in `AGENTS.md`, or **user** for global cycle, token policy, and skills under `~/.codex/`. Install both locations with two apply runs if you want user-level skills plus a project `AGENTS.md`.

**Cursor:** Use `/feature-plan`, `/project-manager`, `/api-new`, etc. **Others:** Reference the generated files in chat (e.g. “Follow `CLAUDE.md`”, “Use the `code-review` skill”).

## What’s inside

**Commands (Cursor):** `/feature-plan`, `/project-manager`, `/new-task`, `/api-new`, `/api-test`, `/api-protect`, `/component-new`, `/page-new`, `/code-review`, `/docs-generate`, `/commit-best`, `/lint`, `/code-explain`, `/code-optimize`, `/code-cleanup`, and more (16+ commands).

**Agents (17):** backend-architect, frontend-architect, backend-reviewer, frontend-reviewer, e2e-runner, database-expert, requirements-analyst, tech-stack-researcher, security-engineer, performance-engineer, architecture-strategist, system-architect, pattern-recognition-specialist, refactoring-expert, learning-guide, technical-writer, deep-research-agent—all aligned to the compounding cycle and token policy.

**Skills (19):** project-manager, feature-planning, agent-selection, code-review, api-design-patterns, api-testing, e2e-playwright, accessibility-checklist, backend-architect, frontend-architect, backend-reviewer, frontend-reviewer, security-audit, performance-profiling, refactoring-checklist, requirements-discovery, docs-structure, postgresql, nosql-databases.

**Rules (7):** **token-policy** (always on), core-standards, **compounding-dev-cycle**, typescript, react, api-routes, e2e-tests.

## Best for

Next.js, TypeScript, React, Supabase, and full-stack projects. Works with any stack.

## Requirements

**Cursor**, **Claude Code**, **GitHub Copilot**, or **Codex** (at least one). For Cursor, apply the workflow via VS Code first; then you get the full slash-command experience in Cursor.

## Customization

Edit workflow content per assistant:

The Cursor plugin manifest is in **`workflow/cursor-plugin/`** (paths inside point to `.cursor/` when copied). Apply copies `workflow/cursor/` and `workflow/cursor-plugin/` to your workspace `.cursor/` and `.cursor-plugin/`.

- **Cursor:** `workflow/cursor/` — start with `rules/token-policy.mdc` and `rules/compounding-dev-cycle.mdc`.
- **Claude Code:** `workflow/claude/` — agents, rules, skills, hooks, `CLAUDE.md`. Apply copies to `.claude/` and `CLAUDE.md`.
- **GitHub Copilot:** `workflow/copilot/` — `copilot-instructions.md`, `instructions/` (including `token-policy.instructions.md`), `agents/`, `workflows/`, `AGENTS.md`.
- **Codex:** `workflow/codex/` — `skills/`, `rules/token-policy.md`, `AGENTS.md` (project), `user/AGENTS.md` (user). Apply prompts for project vs `~/.codex/`.

After changing any tree, rebuild and repackage the extension so the next Apply uses the updated content.

## More info

- **Developer guide:** Command Palette → **Plan-Code-Review: Open Developer Guide**
- **Publishing:** Command Palette → **Plan-Code-Review: Open Publishing Guide**

## License & author

Licensed under MIT. See [`LICENSE`](LICENSE).
