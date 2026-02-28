# Publishing This Project as a VS Code Extension

Step-by-step instructions for publishing **Plan-Code-Review Workflow** to the **VS Code Marketplace** and **Open VSX** (used by Cursor and other VS Code–compatible editors).

---

## Prerequisites

- **Node.js** 18 or later (LTS recommended)
- **npm** (comes with Node.js)
- A **Microsoft account** (for VS Code Marketplace)
- A **GitHub account** (for Open VSX)

---

## 1. Install the packaging tools

```bash
# VS Code Extension Manager (required for packaging and VS Code Marketplace)
npm install -g @vscode/vsce
```

For Open VSX you use `npx ovsx` (no global install needed).

---

## 2. One-time setup: VS Code Marketplace

### 2.1 Create a Personal Access Token (PAT)

1. Go to [Azure DevOps](https://dev.azure.com) and sign in with your Microsoft account.
2. If you don’t have an organization, create one (free).
3. Click your profile icon (top right) → **Personal access tokens**.
4. Click **+ New Token**.
5. Set:
   - **Name:** e.g. `VS Code Marketplace`
   - **Expiration:** as you prefer (e.g. 90 days or custom).
   - **Scopes:** under **Custom defined**, open **Marketplace** and set **Manage** to *Allow*.
6. Click **Create**, then **copy the token** and store it somewhere safe (it’s shown only once).

### 2.2 Create a publisher

1. Go to [Visual Studio Marketplace – Manage](https://marketplace.visualstudio.com/manage).
2. Sign in with the same Microsoft account.
3. In the left pane, click **Create publisher**.
4. Fill in:
   - **ID:** e.g. `braderpayoy` (cannot be changed later; used in extension URLs).
   - **Name:** e.g. your display name or **JhonCabalejo** (publisher).
5. Complete any other required fields and create the publisher.

### 2.3 Log in with vsce

In your project root:

```bash
vsce login braderpayoy
```

When prompted, paste your Azure DevOps PAT. Use the same publisher ID as in `package.json` (`publisher` field).

---

## 3. One-time setup: Open VSX

Open VSX is used by Cursor and other editors. You publish with a token, not vsce.

1. Go to [open-vsx.org](https://open-vsx.org) and sign in with **GitHub**.
2. Accept the **Publisher Agreement** if prompted.
3. Open [Open VSX – User Settings – Tokens](https://open-vsx.org/user-settings/tokens).
4. Click **Create new token**, give it a name (e.g. `Publish Plan-Code-Review Workflow`), and create it.
5. **Copy the token** and store it securely; it won’t be shown again.

The **namespace** (publisher) on Open VSX is taken from your extension’s `package.json` `publisher` field (e.g. `braderpayoy`). The first time you publish, the namespace will be created if it doesn’t exist.

---

## 4. Build and package the extension

In the project root:

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Create the .vsix package (use npx if vsce isn’t global)
npx @vscode/vsce package
```

You should get a file like `plan-code-review-workflow-4.0.4.vsix`.

### Test the .vsix locally

- In VS Code or Cursor: **Extensions** view → **...** (More Actions) → **Install from VSIX...** → select the `.vsix` file.
- Run the commands **Plan-Code-Review: Open Guide** and **Plan-Code-Review: Open Publishing Guide** from the Command Palette to confirm they work.

---

## 5. Publish to the VS Code Marketplace

From the project root:

```bash
# Publish (uses current version in package.json)
vsce publish
```

To bump the version and then publish:

```bash
vsce publish patch   # 3.1.0 → 3.1.1
vsce publish minor   # 3.1.0 → 3.2.0
vsce publish major   # 3.1.0 → 4.0.0
```

After a short delay, the extension will appear on the [VS Code Marketplace](https://marketplace.visualstudio.com/).

---

## 6. Publish to Open VSX (for Cursor and others)

From the project root, using the token you created in step 3:

```bash
npx ovsx publish --pat YOUR_OPENVSX_TOKEN
```

Replace `YOUR_OPENVSX_TOKEN` with your actual token. You can also set it once in an environment variable:

```bash
export OVSX_PAT=your_token_here
npx ovsx publish --pat $OVSX_PAT
```

The extension will appear on [open-vsx.org](https://open-vsx.org) and in Cursor’s extension marketplace (when Cursor is configured to use Open VSX).

---

## 7. Before every release

1. **Bump the version** in `package.json` (e.g. `3.1.0` → `3.1.1`).
2. **Update `CHANGELOG.md`** with the new version and a short list of changes (the marketplace shows this on the extension page).
3. Optionally keep `.cursor-plugin/plugin.json` version in sync if you use it for the Cursor plugin.
4. Run `npm run compile` and then package/publish as above.

---

## 8. Marketplace rules to keep in mind

- **README / CHANGELOG:** No user-provided SVG images; use PNG or [approved badge URLs](https://code.visualstudio.com/api/references/extension-manifest#approved-badges). Use `https` for image URLs.
- **Icon:** In `package.json`, `icon` must point to a PNG (e.g. 128×128). If omitted, the marketplace uses a default.
- **Keywords:** Up to 30 keywords in `package.json` (marketplace limit).

---

## 9. Troubleshooting

| Issue | What to do |
|-------|------------|
| `vsce: command not found` | Run `npm install -g @vscode/vsce` or use `npx @vscode/vsce` instead of `vsce`. |
| 401/403 when publishing (VS Code) | Check that your PAT has **Marketplace → Manage** scope and that the token hasn’t expired. Create the publisher at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage) and use `vsce login <publisher-id>`. |
| Extension name already exists | The extension **name** in `package.json` must be unique across the marketplace. Change `name` (e.g. add a suffix) and try again. |
| Open VSX publish fails | Ensure you’re logged in at open-vsx.org with GitHub and that the token has publish rights. The `publisher` in `package.json` is your Open VSX namespace. |
| User-provided SVG error | Remove or replace SVGs in README.md / CHANGELOG.md with PNG or approved badges. |

---

## 10. Optional: automate with GitHub Actions

You can run `vsce package` and/or `vsce publish` and `ovsx publish` in a GitHub Actions workflow on tag push or release. Store:

- **VS Code Marketplace:** Azure DevOps PAT in a repo secret (e.g. `AZURE_DEVOPS_PAT`).
- **Open VSX:** Open VSX token in a repo secret (e.g. `OVSX_PAT`).

Example (conceptual):

```yaml
# .github/workflows/publish-extension.yml
- run: npm ci && npm run compile
- run: npx @vscode/vsce publish -p ${{ secrets.AZURE_DEVOPS_PAT }}
- run: npx ovsx publish --pat ${{ secrets.OVSX_PAT }}
```

Trigger the workflow on version tags (e.g. `v3.1.0`) after updating `package.json` and `CHANGELOG.md`.

---

For general plugin publishing (Cursor plugin from GitHub), see **PUBLISHING.md**.
