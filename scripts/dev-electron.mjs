import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(import.meta.dirname, '..');
const electronDist = resolve(root, 'electron-dist');
const mainPath = resolve(electronDist, 'electron/main.js');

function compile() {
  console.log('[electron] Compiling TypeScript...');
  execSync('npx tsc -p electron/tsconfig.json', { cwd: root, stdio: 'inherit' });
}

function run() {
  console.log('[electron] Starting Electron...');
  const proc = spawn(
    'npx',
    ['electron', '.'],
    { cwd: root, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'development' } },
  );
  proc.on('exit', () => process.exit());
}

if (!existsSync(mainPath)) {
  compile();
}

run();
