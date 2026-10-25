// Memasang .githooks/pre-commit ke folder hooks git milik repo ini.
// Tidak pernah menimpa hook lain yang sudah ada kecuali dengan --force (cadangan: pre-commit.bak).
//
//   npm run hooks:install
//   npm run hooks:install -- --force
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const force = process.argv.includes('--force');
const source = path.resolve('.githooks/pre-commit');
const hooksDir = path.resolve(execFileSync('git', ['rev-parse', '--git-path', 'hooks'], { encoding: 'utf8' }).trim());
const target = path.join(hooksDir, 'pre-commit');

mkdirSync(hooksDir, { recursive: true });

if (existsSync(target)) {
  if (readFileSync(target, 'utf8') === readFileSync(source, 'utf8')) {
    console.log(`Hook pre-commit sudah terpasang di ${target}`);
    process.exit(0);
  }
  if (!force) {
    console.error(
      `Sudah ada hook pre-commit lain di ${target} (tidak ditimpa).\n` +
        'Tambahkan baris "npm test" ke hook itu, atau ganti dengan: npm run hooks:install -- --force',
    );
    process.exit(1);
  }
  copyFileSync(target, `${target}.bak`);
  console.log(`Hook lama dicadangkan ke ${target}.bak`);
}

copyFileSync(source, target);
chmodSync(target, 0o755);
console.log(`Hook pre-commit terpasang di ${target}`);
