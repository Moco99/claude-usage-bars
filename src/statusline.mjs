import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ─────────────────────────────────────────
// Sección: Config
// ─────────────────────────────────────────

const DEFAULTS = { usageColor: '#B3B9F4', ctxColor: '#CA7C5E' };
const BAR_WIDTH = 10;

function loadConfig() {
  const configPath = join(homedir(), '.claude', 'claude-usage-bars.json');
  if (!existsSync(configPath)) return DEFAULTS;
  try { return { ...DEFAULTS, ...JSON.parse(readFileSync(configPath, 'utf8')) }; }
  catch { return DEFAULTS; }
}

// ─────────────────────────────────────────
// Sección: ANSI colors
// ─────────────────────────────────────────

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

const RESET = '\x1b[0m';
const DIM = '\x1b[38;2;128;128;128m';

function fg(hex) {
  const [r, g, b] = hexToRgb(hex);
  return `\x1b[38;2;${r};${g};${b}m`;
}

// ─────────────────────────────────────────
// Sección: Bar rendering
// ─────────────────────────────────────────

function renderBar(pct, color) {
  const filled = Math.round(Math.min(100, Math.max(0, pct)) / 100 * BAR_WIDTH);
  return `${fg(color)}${'█'.repeat(filled)}${'░'.repeat(BAR_WIDTH - filled)}${RESET}`;
}

// Claude Code sends resets_at as Unix epoch seconds (not ISO datetime)
function hoursUntil(epochSeconds) {
  if (!epochSeconds) return null;
  const diff = epochSeconds * 1000 - Date.now();
  return diff > 0 ? Math.ceil(diff / 3_600_000) : null;
}

// ─────────────────────────────────────────
// Sección: Stdin → parse → render
// ─────────────────────────────────────────

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
let input = {};
try { input = JSON.parse(Buffer.concat(chunks).toString()); } catch { }

const usagePct = input.rate_limits?.five_hour?.used_percentage ?? 0;
const hours = hoursUntil(input.rate_limits?.five_hour?.resets_at ?? null);
const ctxPct = input.context_window?.used_percentage ?? 0;

const config = loadConfig();

const usgLabel = `${DIM}usg${RESET} `;
const ctxLabel = `  ${DIM}ctx${RESET} `;
const usgStats = ` ${DIM}${Math.round(usagePct)}%${hours ? `·${hours}h` : ''}${RESET}`;
const ctxStats = ` ${DIM}${Math.round(ctxPct)}%${RESET}`;

const output =
  usgLabel + renderBar(usagePct, config.usageColor) + usgStats +
  ctxLabel + renderBar(ctxPct, config.ctxColor) + ctxStats;

process.stdout.write(output);
