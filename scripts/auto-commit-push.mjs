import chokidar from 'chokidar';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const watchedPaths = [
  'src',
  'scripts',
  'prisma/schema.prisma',
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'eslint.config.mjs',
  '.vscode/tasks.json',
];
const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css']);
const pendingFiles = new Set();
let debounceTimer;
let processing = false;

function runGit(args, options = {}) {
  return spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : 'pipe',
  });
}

function isCodeFile(filePath) {
  const normalizedPath = filePath.replaceAll('\\', '/');
  return normalizedPath.startsWith('src/') || normalizedPath.startsWith('scripts/')
    ? codeExtensions.has(extname(normalizedPath))
    : watchedPaths.includes(normalizedPath);
}

function scheduleCommit() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(commitChangedFiles, 1500);
}

function commitChangedFiles() {
  if (processing || pendingFiles.size === 0) return;
  processing = true;
  const files = [...pendingFiles];
  pendingFiles.clear();

  try {
    const stagedChanges = runGit(['diff', '--cached', '--quiet']);
    if (stagedChanges.status === 1) {
      console.error('Auto-commit dilewati: ada perubahan staged sebelum watcher berjalan.');
      return;
    }
    if (stagedChanges.status !== 0) {
      console.error('Auto-commit dilewati: status Git tidak dapat diperiksa.');
      return;
    }

    const addResult = runGit(['add', '--all', '--', ...files], { inherit: true });
    if (addResult.status !== 0) return;

    const stagedFiles = runGit(['diff', '--cached', '--name-only']);
    if (stagedFiles.status !== 0 || !stagedFiles.stdout.trim()) return;

    const commitResult = runGit(
      ['commit', '-m', `auto: update ${files.length} code file${files.length === 1 ? '' : 's'}`],
      { inherit: true },
    );
    if (commitResult.status === 0) {
      console.log('Commit selesai; hook post-commit menjalankan git push.');
    }
  } finally {
    processing = false;
    if (pendingFiles.size > 0) scheduleCommit();
  }
}

const watcher = chokidar.watch(watchedPaths, {
  cwd: repoRoot,
  ignoreInitial: true,
  ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
});

watcher.on('all', (event, filePath) => {
  if (!['add', 'change', 'unlink'].includes(event) || !isCodeFile(filePath)) return;
  pendingFiles.add(filePath.replaceAll('\\', '/'));
  console.log(`Perubahan terdeteksi: ${filePath}`);
  scheduleCommit();
});

watcher.on('error', (error) => {
  console.error('Watcher berhenti karena error:', error);
  process.exitCode = 1;
});

console.log('Auto-commit aktif; tes dijalankan oleh hook sebelum commit, push oleh hook sesudahnya.');
