#!/usr/bin/env bash
set -Eeuo pipefail

# Non-destructive Violet / We-Talk backup. Never deletes source data.
VIOLET_ROOT="${VIOLET_ROOT:-$HOME/VioletAI}"
BACKUP_ROOT="${BACKUP_ROOT:-$HOME/VioletBackups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="$BACKUP_ROOT/$STAMP"

[ -d "$VIOLET_ROOT" ] || { echo "VIOLET_ROOT not found: $VIOLET_ROOT" >&2; exit 2; }
mkdir -p "$DEST"

echo "Backing up $VIOLET_ROOT -> $DEST"
tar   --exclude='.git/objects'   --exclude='node_modules'   --exclude='venv'   --exclude='.venv'   --exclude='__pycache__'   --exclude='.cache'   -czf "$DEST/violet-files.tar.gz"   -C "$(dirname "$VIOLET_ROOT")" "$(basename "$VIOLET_ROOT")"

if [ -n "${DATABASE_URL:-}" ] && command -v pg_dump >/dev/null 2>&1; then
  pg_dump "${DATABASE_URL}" --format=custom --file="$DEST/postgres.dump"
  echo "PostgreSQL dump created."
fi

(
  cd "$DEST"
  sha256sum violet-files.tar.gz > SHA256SUMS
  [ ! -f postgres.dump ] || sha256sum postgres.dump >> SHA256SUMS
)

tar -tzf "$DEST/violet-files.tar.gz" >/dev/null
sha256sum -c "$DEST/SHA256SUMS"

cat > "$DEST/RESTORE.txt" <<EOF
Violet / We-Talk restore evidence
Created: $STAMP
Source: $VIOLET_ROOT

Files:
  tar -xzf violet-files.tar.gz -C <SAFE_RESTORE_PARENT>

PostgreSQL, when postgres.dump exists:
  createdb <RESTORE_DB>
  pg_restore --dbname=<RESTORE_DB> postgres.dump

Restore into a separate destination first. Do not overwrite the live source until verification passes.
EOF

echo "Backup verified: $DEST"
