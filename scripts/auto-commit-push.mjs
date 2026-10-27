import chokidar from 'chokidar';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const commitScript = fileURLToPath(new URL('./commit-and-push-now.mjs', import.meta.url));
const watchedPaths = [
  'src',
  'scripts',
  'prisma',
  'public',
  '.cursor',
  '.githooks',
  '.vscode',
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'eslint.config.mjs',
  'vitest.config.ts',
];

let debounceTimer;
let running = false;
let rerun = false;

function scheduleCommit() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runCommitAndPush, 2000);
}

function runCommitAndPush() {
  if (running) {
    rerun = true;
    return;
  }
  running = true;
  const child = spawn(process.execPath, [commitScript], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  child.on('exit', () => {
    running = false;
    if (rerun) {
      rerun = false;
      scheduleCommit();
    }
  });
}

const watcher = chokidar.watch(watchedPaths, {
  cwd: repoRoot,
  ignoreInitial: true,
  ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**', '**/.env', '**/.env.*'],
});

watcher.on('all', (event, filePath) => {
  if (!['add', 'change', 'unlink'].includes(event)) return;
  console.log(`Perubahan terdeteksi: ${filePath}`);
  scheduleCommit();
});

watcher.on('error', (error) => {
  console.error('Watcher berhenti karena error:', error);
  process.exitCode = 1;
});

console.log('Auto-commit + push aktif. Simpan file, lalu perubahan akan di-commit dan di-push.');
