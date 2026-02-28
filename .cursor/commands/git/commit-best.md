---
description: Create a well-structured commit with proper message and push
model: claude-sonnet-4-5
---

Create the best commit for the current changes. Follow these steps exactly.

## Workflow

### Step 1: Check Current Branch

Run:
```bash
git branch --show-current
```

### Step 2: Create New Branch (Only if on main)

If the current branch is `main` or `master`:
- Generate a branch name from the changes (e.g., `feat/add-user-auth`, `fix/login-validation`, `docs/update-readme`)
- Run: `git checkout -b <branch-name>`

If already on a feature branch, skip this step.

### Step 3: Stage Changes (Only if there are uncommitted changes)

Run:
```bash
git status
```

If there are **untracked or modified files** (not yet staged):
```bash
git add .
```

If the working tree is clean (nothing to commit), stop and inform the user.

### Step 4: Generate Commit Message

Analyze the staged changes:
```bash
git diff --staged --stat
git diff --staged
```

Generate a commit message using **Conventional Commits** format:

```
<type>(<scope>): <short description>

[optional body]
```

**Types:**
| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no code change) |
| `refactor` | Code change that neither fixes nor adds feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, config, dependencies, tooling |
| `ci` | CI/CD changes |

**Scope** (optional): area affected (e.g., `auth`, `api`, `ui`)

**Rules:**
- Use imperative mood: "add" not "added", "fix" not "fixed"
- Keep first line under 72 characters
- No period at end of subject line
- If multiple logical changes, suggest splitting into separate commits

### Step 5: Commit

```bash
git commit -m "<type>(<scope>): <description>"
```

For longer messages:
```bash
git commit -m "<type>(<scope>): <subject>" -m "<body>"
```

### Step 6: Push

```bash
git push -u origin $(git branch --show-current)
```

Use `-u origin <branch>` to set upstream for new branches.

## Summary Checklist

- [ ] Check current branch
- [ ] If on main → create and checkout new branch
- [ ] If uncommitted changes → `git add .`
- [ ] Analyze diff → generate conventional commit message
- [ ] `git commit -m "..."`
- [ ] `git push -u origin <branch>`

## Example Output

```
feat(auth): add JWT login endpoint

Implement POST /api/auth/login with token validation
```

```
fix(ui): correct button alignment on mobile

Flex layout was overflowing on viewports < 375px
```

```
docs: update hooks README with usage examples
```

Execute the workflow. If any step fails (e.g., nothing to commit, push rejected), report the error and suggest next steps.
