import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ─────────────────────────────────────────
// Sección: Paths
// ─────────────────────────────────────────

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
const homeDir = homedir();
const settingsPath = join(homeDir, '.claude', 'settings.json');
const configPath = join(homeDir, '.claude', 'claude-usage-bars.json');
const defaultsPath = new URL('../config/defaults.json', import.meta.url).pathname;

// ─────────────────────────────────────────
// Sección: Build expected statusLine config
// ─────────────────────────────────────────

const expectedCommand = `node "${pluginRoot}/src/statusline.mjs"`;
const expectedStatusLine = {
  type: 'command',
  command: expectedCommand,
  padding: 0,
  refreshInterval: 10,
};

// ─────────────────────────────────────────
// Sección: Update settings.json (idempotent)
// ─────────────────────────────────────────

let settings = {};
if (existsSync(settingsPath)) {
  settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
}

const current = settings.statusLine;
const needsUpdate =
  !current ||
  typeof current !== 'object' ||
  current.type !== expectedStatusLine.type ||
  current.command !== expectedStatusLine.command;

if (needsUpdate) {
  settings.statusLine = expectedStatusLine;
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

// ─────────────────────────────────────────
// Sección: Seed user color config
// ─────────────────────────────────────────

if (!existsSync(configPath)) {
  const defaults = readFileSync(defaultsPath, 'utf8');
  writeFileSync(configPath, defaults);
}
