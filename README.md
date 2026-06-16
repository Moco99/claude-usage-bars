# claude-usage-bars

A Claude Code plugin that shows usage and context progress bars in the status line.

```
▶▶ accept edits on (shift+tab to cycle)    usg ████████░░ 79%·3h  ctx █████░░░░░ 48%
```

## Installation

**1. Add the marketplace:**

```bash
# Add marketplace to Claude Code (run once)
claude plugin marketplace add moco99 https://raw.githubusercontent.com/Moco99/claude-usage-bars/main/marketplace.json
```

**2. Install the plugin:**

```
/plugin install claude-usage-bars@moco99
```

That's it. The bars appear automatically on your next prompt.

## Bars

| Bar | Color | Data source |
|-----|-------|-------------|
| `usg` | `#B3B9F4` (lavender) | Rate limit usage — resets every 5h |
| `ctx` | `#CA7C5E` (orange) | Context window tokens used |

The `·Xh` next to the usage bar shows hours until your rate limit resets.

## Customize colors

```
/bar-colors --usage #FF6B6B --ctx #4ECDC4
```

Both flags are optional — you can change one or both at a time. Colors must be in `#RRGGBB` format.

## How it works

- A `statusline` script reads JSON from Claude Code's native status line mechanism (stdin) and renders colored Unicode bars via ANSI escape codes
- A `SessionStart` hook auto-configures `~/.claude/settings.json` on first run (idempotent)
- User colors are stored in `~/.claude/claude-usage-bars.json`
- No npm dependencies — pure Node.js

## Uninstall

```
/plugin uninstall claude-usage-bars
```

This removes the plugin. The `statusline` entry in `~/.claude/settings.json` will need to be removed manually (or it will silently fail to find the script).
