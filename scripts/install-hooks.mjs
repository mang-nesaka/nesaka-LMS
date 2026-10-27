// Memasang hook dari .githooks ke folder hooks git milik repo ini.
// Tidak menimpa hook lain yang sudah ada kecuali dengan --force (cadangan: <nama>.bak).
//
//   npm run hooks:install
//   npm run hooks:install -- --force
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const force = process.argv.includes('--force');
const hookNames = ['pre-commit', 'post-commit'];
const hooksDir = path.resolve(execFileSync('git', ['rev-parse', '--git-path', 'hooks'], { encoding: 'utf8' }).trim());
mkdirSync(hooksDir, { recursive: true });

let failed = false;

for (const hookName of hookNames) {
  const source = path.resolve('.githooks', hookName);
  const target = path.join(hooksDir, hookName);
  if (!existsSync(source)) continue;

  if (existsSync(target) && readFileSync(target, 'utf8') === readFileSync(source, 'utf8')) {
    console.log(`Hook ${hookName} sudah terpasang di ${target}`);
    continue;
  }

  if (existsSync(target) && !force) {
    console.error(
      `Sudah ada hook ${hookName} lain di ${target} (tidak ditimpa).\n` +
        `Ganti dengan: npm run hooks:install -- --force`,
    );
    failed = true;
    continue;
  }

  if (existsSync(target) && force) {
    copyFileSync(target, `${target}.bak`);
    console.log(`Hook ${hookName} lama dicadangkan ke ${target}.bak`);
  }

  copyFileSync(source, target);
  chmodSync(target, 0o755);
  console.log(`Hook ${hookName} terpasang di ${target}`);
}

if (failed) process.exit(1);
