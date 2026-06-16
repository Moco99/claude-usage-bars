import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
const homeDir = homedir();
const settingsPath = join(homeDir, '.claude', 'settings.json');
const configPath = join(homeDir, '.claude', 'claude-usage-bars.json');
const defaultsPath = new URL('../config/defaults.json', import.meta.url).pathname;

const expectedStatusline = `node "${pluginRoot}/src/statusline.mjs"`;

let settings = {};
if (existsSync(settingsPath)) {
  settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
}

let settingsChanged = false;

if (settings.statusline !== expectedStatusline) {
  settings.statusline = expectedStatusline;
  settingsChanged = true;
}

if (!settings.statuslineRefreshInterval) {
  settings.statuslineRefreshInterval = 10;
  settingsChanged = true;
}

if (settingsChanged) {
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

if (!existsSync(configPath)) {
  const defaults = readFileSync(defaultsPath, 'utf8');
  writeFileSync(configPath, defaults);
}
