---
name: bar-colors
description: "Change the colors of the usage and context bars in Claude Code's status line. Usage: /bar-colors --usage #RRGGBB --ctx #RRGGBB"
argument-hint: "--usage <#hex> --ctx <#hex>"
allowed-tools: [Read, Write]
---

The user wants to customize the bar colors for claude-usage-bars.

Parse the --usage and --ctx hex color values from the arguments (either or both may be provided).

Validate each provided value: must match the pattern #[0-9A-Fa-f]{6}.
If a value is invalid, tell the user and stop.

Read ~/.claude/claude-usage-bars.json (if it doesn't exist, start with defaults: usageColor "#B3B9F4", ctxColor "#CA7C5E").
Update only the keys that were provided in the arguments.
Write the updated JSON back to ~/.claude/claude-usage-bars.json.

Confirm with a single line:
"Updated: usg → <usageColor>  ctx → <ctxColor>"
