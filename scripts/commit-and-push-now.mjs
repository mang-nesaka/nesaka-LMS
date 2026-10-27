import { closeSync, existsSync, mkdirSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const lockPath = join(repoRoot, '.git/auto-commit.lock');
const stampPath = join(repoRoot, '.git/auto-commit.stamp');
const secretName = /(^|\/)(\.env(\..*)?|credentials\.json|\.git-credentials)$/i;

function parseDebounceMs() {
  const flagIndex = process.argv.indexOf('--debounce-ms');
  if (flagIndex === -1) return 0;
  const value = Number(process.argv[flagIndex + 1]);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runGit(args, options = {}) {
  return spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : 'pipe',
  });
}

function blockedByMerge() {
  return existsSync(join(repoRoot, '.git/MERGE_HEAD')) || existsSync(join(repoRoot, '.git/rebase-merge'));
}

function tryLock() {
  mkdirSync(join(repoRoot, '.git'), { recursive: true });
  try {
    const fd = openSync(lockPath, 'wx');
    writeFileSync(fd, String(process.pid));
    closeSync(fd);
    return true;
  } catch {
    return false;
  }
}

function unlock() {
  try {
    unlinkSync(lockPath);
  } catch {
    // ignore
  }
}

function unstageSecrets(stagedFiles) {
  const secrets = stagedFiles.filter((file) => secretName.test(file));
  if (secrets.length === 0) return [];
  runGit(['reset', '-q', 'HEAD', '--', ...secrets]);
  return secrets;
}

async function waitForQuiet(debounceMs) {
  if (debounceMs <= 0) return true;
  const token = `${Date.now()}-${Math.random()}`;
  writeFileSync(stampPath, token);
  await sleep(debounceMs);
  return readFileSync(stampPath, 'utf8') === token;
}

async function main() {
  const debounceMs = parseDebounceMs();
  if (!(await waitForQuiet(debounceMs))) return 0;
  if (blockedByMerge()) {
    console.error('Auto-commit dilewati: merge/rebase sedang berjalan.');
    return 0;
  }
  if (!tryLock()) {
    console.error('Auto-commit dilewati: proses lain sedang commit.');
    return 0;
  }

  try {
    runGit(['add', '-A']);
    const staged = runGit(['diff', '--cached', '--name-only']);
    if (staged.status !== 0) {
      console.error('Auto-commit dilewati: status Git tidak dapat dibaca.');
      return 1;
    }

    const files = staged.stdout.split('\n').map((line) => line.trim()).filter(Boolean);
    const skippedSecrets = unstageSecrets(files);
    const remaining = files.filter((file) => !skippedSecrets.includes(file));
    if (skippedSecrets.length) {
      console.error(`File rahasia tidak di-commit: ${skippedSecrets.join(', ')}`);
    }
    if (remaining.length === 0) return 0;

    const summary = remaining.slice(0, 4).join(', ');
    const extra = remaining.length > 4 ? ` (+${remaining.length - 4})` : '';
    const commit = runGit(['commit', '-m', `auto: ${summary}${extra}`], { inherit: true });
    if (commit.status !== 0) return commit.status ?? 1;

    const push = runGit(['push', '-u', 'origin', 'HEAD'], { inherit: true });
    if (push.status !== 0) {
      console.error('Commit berhasil, tetapi git push gagal.');
      return push.status ?? 1;
    }
    return 0;
  } finally {
    unlock();
  }
}

process.exit(await main());
