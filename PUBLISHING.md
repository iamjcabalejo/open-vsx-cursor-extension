# Publishing Guide: Brader Payoy's Cursor Plugin

Complete step-by-step instructions for publishing your Cursor plugin to GitHub and as a VS Code extension (VS Code Marketplace + Open VSX).

## How this plugin works

This plugin is built around a **compounding development cycle** (Plan → Code → Review/Test → Plan). Users run `/feature-plan` to create a plan file in `docs/plans/`, then `/project-manager <plan-path>` to implement from that plan. The project-manager runs implementation agents (backend, frontend, E2E authoring), then **automatically** runs code reviewers; if critical issues are found, it loops until the code is production ready. **Hooks** inject cycle context at session start and keep edits formatted and audited. See **README.md** for full documentation.

## Prerequisites

- [ ] GitHub account
- [ ] Git installed locally
- [ ] All configuration files updated (`.cursor-plugin/plugin.json`, `.cursor/` commands, agents, skills, rules, hooks) ✅

## Step 1: Create GitHub Repository

### 1.1 Create New Repository on GitHub

1. Go to https://github.com/new
2. Fill in the details:
   - **Repository name**: `whatever-name-you-like`
   - **Description**: "Brader Payoy's Cursor setup: 15 commands, 17 AI agents, 14 skills, 6 rules, and hooks. Plan → Code → Review/Test cycle with feature-plan and project-manager."
   - **Visibility**: Public (so others can install it)
   - **Initialize**: ❌ Don't add README, .gitignore, or license (we already have these)
3. Click "Create repository"

### 1.2 Push Your Local Repository

Once the GitHub repository is created, run these commands:

```bash
cd ~/Documents/GitHub/whatever-name-you-like

# Add the GitHub remote
git remote add origin https://github.com/@username/whatever-name-you-like.git

# Push your code
git push -u origin main
```

If you encounter authentication issues:
- Use a Personal Access Token instead of password
- Or set up SSH keys (recommended): https://docs.github.com/en/authentication/connecting-to-github-with-ssh

## Step 2: Share Your Plugin

Your README already includes your GitHub username `iamjcabalejo`, so users can copy-paste commands directly. The plugin is defined in `.cursor-plugin/plugin.json`, which registers **commands** (`.cursor/commands/`), **agents** (`.cursor/agents/`), **skills** (`.cursor/skills/`), **rules** (`.cursor/rules/`), and **hooks** (`.cursor/hooks.json`). After install, users should run `chmod +x .cursor/hooks/*.sh` so hook scripts are executable.

Example summary for sharing (align with your current `plugin.json` version and description):

```json
{
  "name": "payoys-cursor-sub-agents",
  "description": "Brader Payoy's Cursor setup: 15 commands, 17 AI agents, 14 skills, 6 rules, and hooks for Plan → Code → Review/Test cycle",
  "version": "1.0.0",
  "author": "Brader Payoy"
}
```

Install from GitHub: **Install Plugin from GitHub** → `iamjcabalejo/payoys-cursor-sub-agents`, or CLI: `cursor plugins install iamjcabalejo/payoys-cursor-sub-agents`.

### Option C: Share on Social Media

Example post:

```
🚀 Just published my Cursor setup as a plugin!

15 slash commands + 17 AI agents + 14 skills + 6 rules + hooks

Core workflow: Plan → Code → Review/Test → Plan
✅ /feature-plan — write plan to docs/plans/
✅ /project-manager — implement from plan, auto code review, loop until production ready
✅ Hooks — session cycle reminder, format on edit, audit log for traceability

Plus: API scaffolding, E2E (Playwright), security & performance agents, Supabase/Next.js/TypeScript.

Perfect for full-stack and Next.js + Supabase projects!
```

## Step 3: Maintain Your Plugin

### Updating Your Plugin

When you make changes to your local setup (commands, agents, skills, rules, or hooks):

```bash
cd ~/Documents/GitHub/your-repo-name

# Make your changes in .cursor/commands/, .cursor/agents/, .cursor/skills/, .cursor/rules/, or .cursor/hooks.json and .cursor/hooks/*.sh
# Then commit and push

git add .
git commit -m "Add new command: /new-command-name"

# Update version in .cursor-plugin/plugin.json when appropriate
# Bump version: 1.0.0 -> 1.1.0

git add .cursor-plugin/plugin.json
git commit -m "Bump version to 1.1.0"

git push
```

### Versioning Guidelines

- **1.0.x** - Bug fixes and minor tweaks
- **1.x.0** - New commands or agents added
- **x.0.0** - Major restructuring or breaking changes

## Troubleshooting

### Issue: Plugin Won't Install

Check:
- Repository is public on GitHub
- `.cursor-plugin/plugin.json` exists in the repo root
- `plugin.json` has valid syntax (no trailing commas, proper quotes)
- Paths in `plugin.json` point to existing dirs: `commands`, `agents`, `skills`, `rules`, and `hooks` (`.cursor/hooks.json`)

### Issue: Commands Don't Appear

Check:
- `plugin.json` includes `"commands": ".cursor/commands/"` (or your path)
- Command files under that path have `.md` extension and are not empty

### Issue: Agents Don't Activate

Check:
- `plugin.json` includes `"agents": ".cursor/agents/"`
- Agent files have proper frontmatter with `name` and `description`
- Agents activate based on context, not slash commands

### Issue: Hooks Don't Run

Check:
- `plugin.json` includes `"hooks": ".cursor/hooks.json"`
- `.cursor/hooks.json` exists and lists the hook events and script paths (e.g. `.cursor/hooks/format.sh`)
- Hook scripts are executable: run `chmod +x .cursor/hooks/*.sh`
- Script paths in `hooks.json` are relative to the project root

## Advanced: Creating Releases

For major versions, create GitHub releases:

1. Go to your repo: https://github.com/@username/whatever-name-you-like
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `v1.0.0 - Initial Release`
5. Description: List of features/changes
6. Click "Publish release"

## Publishing as a VS Code Extension

This repo is also a VS Code extension so you can publish it to the **VS Code Marketplace** and **Open VSX** (used by Cursor’s extension marketplace).

### Prerequisites

- Node.js 18+ (LTS)
- [vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension): `npm install -g @vscode/vsce`
- For Open VSX: [ovsx](https://www.npmjs.com/package/ovsx) (use via `npx ovsx`)

### One-time setup

1. **VS Code Marketplace**
   - Create a [Personal Access Token](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate) in Azure DevOps with **Marketplace → Manage** scope.
   - Create a publisher at https://marketplace.visualstudio.com/manage (e.g. ID: `braderpayoy`).
   - Run: `vsce login braderpayoy` and paste the PAT.

2. **Open VSX**
   - Sign in at [open-vsx.org](https://open-vsx.org) with GitHub and accept the Publisher Agreement.
   - Create a token at https://open-vsx.org/user-settings/tokens and save it securely.

### Build and package

```bash
# Install dependencies
npm install

# Compile and create .vsix
npm run compile
vsce package
```

This produces `payoys-cursor-sub-agents-3.1.0.vsix`. You can install it locally via **Extensions** → **Views and More Actions** → **Install from VSIX...**.

### Publish

**To VS Code Marketplace:**

```bash
vsce publish
# or bump version: vsce publish patch
```

**To Open VSX (Cursor’s extension source):**

```bash
npx ovsx publish --pat YOUR_OPENVSX_TOKEN
```

**Optional:** Use a GitHub Action to publish to both on tag or release. Ensure the extension `version` in `package.json` is kept in sync with `.cursor-plugin/plugin.json` when you release.

### Notes

- The extension ships the guide commands and README/PUBLISHING; the full Cursor plugin (commands, agents, skills, rules, hooks) is still installed from GitHub in Cursor via **Install Plugin from GitHub**.
- Do not put user-provided SVGs in README/CHANGELOG; use PNG or approved badge URLs.
- Keep `CHANGELOG.md` updated for each release; the marketplace shows it on the extension page.

---

## Success Metrics

Track your plugin's success:
- ⭐ GitHub stars
- 👁️ GitHub watchers
- 🍴 GitHub forks
- 💬 Issues and discussions
- 📊 Clone/download counts (GitHub Insights)

## Getting Help

If you run into issues:
- Cursor Docs: https://docs.cursor.com
- Cursor Community: Search for Cursor plugins on GitHub
- GitHub Issues: Check Cursor's official repository for support

---

**Congratulations!** Once published, your plugin will be available for the Cursor community to use and learn from. Happy sharing! 🎉
