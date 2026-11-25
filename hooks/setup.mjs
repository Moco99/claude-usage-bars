import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ─────────────────────────────────────────
// Sección: Paths
// ─────────────────────────────────────────

// Fallback keeps the command valid if the env var is ever missing.
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), '..');
const homeDir = homedir();
const settingsPath = join(homeDir, '.claude', 'settings.json');
const configPath = join(homeDir, '.claude', 'claude-usage-bars.json');
// fileURLToPath decodes %20 and handles Windows drive letters, unlike URL.pathname.
const defaultsPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'config', 'defaults.json');

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
  try {
    settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
  } catch {
    // Never overwrite a settings file we cannot parse.
    process.exit(0);
  }
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
