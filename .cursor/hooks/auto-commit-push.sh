#!/bin/sh
# Commit dan push perubahan setelah file diedit di Cursor.
cat >/dev/null
cd "$(dirname "$0")/../.." || exit 0

if [ "$1" = "--now" ]; then
  node scripts/commit-and-push-now.mjs
else
  node scripts/commit-and-push-now.mjs --debounce-ms 2500
fi

echo '{}'
exit 0
