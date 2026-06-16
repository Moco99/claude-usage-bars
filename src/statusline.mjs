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
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(configPath, 'utf8')) };
  } catch {
    return DEFAULTS;
  }
}

// ─────────────────────────────────────────
// Sección: ANSI colors
// ─────────────────────────────────────────

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
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
  const empty = BAR_WIDTH - filled;
  return `${fg(color)}${'█'.repeat(filled)}${'░'.repeat(empty)}${RESET}`;
}

function hoursUntil(isoString) {
  if (!isoString) return null;
  const diff = new Date(isoString) - Date.now();
  if (diff <= 0) return null;
  return Math.ceil(diff / 3_600_000);
}

// ─────────────────────────────────────────
// Sección: Stdin → parse → render
// ─────────────────────────────────────────

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

let input = {};
try {
  input = JSON.parse(Buffer.concat(chunks).toString());
} catch {
  // If stdin is empty or invalid, render empty bars
}

const config = loadConfig();

const usagePct = input.rate_limits?.used_percentage ?? 0;
const resetsAt = input.rate_limits?.resets_at ?? null;
const hours = hoursUntil(resetsAt);

const ctxUsed = input.context_window?.tokens_used ?? 0;
const ctxTotal = input.context_window?.tokens_total ?? 0;
const ctxPct = ctxTotal > 0 ? Math.round((ctxUsed / ctxTotal) * 100) : 0;

const usgLabel = `${DIM}usg${RESET} `;
const ctxLabel = `  ${DIM}ctx${RESET} `;
const usgStats = ` ${DIM}${Math.round(usagePct)}%${hours ? `·${hours}h` : ''}${RESET}`;
const ctxStats = ` ${DIM}${ctxPct}%${RESET}`;

const output =
  usgLabel +
  renderBar(usagePct, config.usageColor) +
  usgStats +
  ctxLabel +
  renderBar(ctxPct, config.ctxColor) +
  ctxStats;

process.stdout.write(output);
