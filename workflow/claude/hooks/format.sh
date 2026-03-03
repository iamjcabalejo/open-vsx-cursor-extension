#!/bin/bash
# Runs after agent edits a file. Format the edited file if formatter exists.
# Receives JSON via stdin: {"file_path":"<path>","edits":[...]}
# Customize to run: prettier --write, eslint --fix, etc.

input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4)

if [ -n "$file_path" ] && [ -f "$file_path" ]; then
  # Run Prettier if available (npm/pnpm projects)
  if command -v npx &>/dev/null && [ -f "package.json" ]; then
    npx prettier --write "$file_path" 2>/dev/null || true
  fi
fi

exit 0
