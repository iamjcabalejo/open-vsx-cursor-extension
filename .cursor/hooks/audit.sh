#!/bin/bash
# Audit hook: logs hook events. Receives JSON via stdin.
# Customize to forward to logging service, analytics, or security audit.
# Exit 0 = allow; exit 2 = block (for beforeShellExecution, beforeMCPExecution)

input=$(cat)
event=$(echo "$input" | grep -o '"hook_event_name":"[^"]*"' | cut -d'"' -f4)
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Log to .cursor/hooks/audit.log (optional)
log_dir=".cursor/hooks"
log_file="$log_dir/audit.log"
mkdir -p "$log_dir" 2>/dev/null
[ -w "$log_dir" ] && echo "{\"event\":\"${event:-unknown}\",\"timestamp\":\"$timestamp\"}" >> "$log_file" 2>/dev/null || true

# beforeShellExecution requires permission in output
case "$event" in
  beforeShellExecution) echo '{"permission":"allow"}' ;;
  *) echo '{}' ;;
esac
exit 0
