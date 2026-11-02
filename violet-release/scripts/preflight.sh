#!/usr/bin/env bash
set -Eeuo pipefail

# Violet / We-Talk release preflight.
# Read-only against the application/runtime. It writes only a timestamped evidence receipt.
VIOLET_ROOT="${VIOLET_ROOT:-$HOME/VioletAI}"
VIOLET_PORT="${VIOLET_PORT:-8790}"
LEGACY_CORE_PORT="${LEGACY_CORE_PORT:-8882}"
BRIDGE_PORT="${BRIDGE_PORT:-8787}"
INTERFACE_PORT="${INTERFACE_PORT:-8766}"
EVIDENCE_DIR="${EVIDENCE_DIR:-$PWD/release-evidence}"
MIN_DISK_GB="${MIN_DISK_GB:-10}"
MIN_MEM_MB="${MIN_MEM_MB:-2048}"

mkdir -p "$EVIDENCE_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RECEIPT="$EVIDENCE_DIR/preflight-$STAMP.txt"
FAILURES=0
WARNINGS=0

exec > >(tee "$RECEIPT") 2>&1

pass(){ printf 'PASS  %s\n' "$*"; }
warn(){ WARNINGS=$((WARNINGS+1)); printf 'WARN  %s\n' "$*"; }
fail(){ FAILURES=$((FAILURES+1)); printf 'FAIL  %s\n' "$*"; }

printf 'Violet / We-Talk release preflight\nUTC: %s\nRoot: %s\n\n' "$STAMP" "$VIOLET_ROOT"

for cmd in python3 git curl; do
  command -v "$cmd" >/dev/null 2>&1 && pass "$cmd available" || fail "$cmd missing"
done
for cmd in node npm docker psql redis-cli ollama; do
  command -v "$cmd" >/dev/null 2>&1 && pass "$cmd available" || warn "$cmd not installed or not on PATH"
done

DISK_GB="$(df -Pk "$HOME" | awk 'NR==2 {printf "%.0f", $4/1024/1024}')"
if [ "$DISK_GB" -ge "$MIN_DISK_GB" ]; then pass "free disk ${DISK_GB}GB"; else fail "free disk ${DISK_GB}GB < ${MIN_DISK_GB}GB"; fi

if command -v free >/dev/null 2>&1; then
  MEM_MB="$(free -m | awk '/Mem:/ {print $7}')"
  if [ "${MEM_MB:-0}" -ge "$MIN_MEM_MB" ]; then pass "available memory ${MEM_MB}MB"; else warn "available memory ${MEM_MB:-unknown}MB < ${MIN_MEM_MB}MB"; fi
fi

if [ -d "$VIOLET_ROOT/.git" ]; then
  SHA="$(git -C "$VIOLET_ROOT" rev-parse HEAD)"
  BRANCH="$(git -C "$VIOLET_ROOT" branch --show-current)"
  printf 'GIT   branch=%s sha=%s\n' "$BRANCH" "$SHA"
  if [ -n "$(git -C "$VIOLET_ROOT" status --porcelain)" ]; then warn "working tree has uncommitted changes"; else pass "working tree clean"; fi
else
  warn "VIOLET_ROOT is not a Git working tree"
fi

probe(){
  local name="$1" port="$2"
  local ok=0
  for path in /health /api/health /api/_healthcheck /; do
    if curl --silent --show-error --fail --max-time 3 "http://127.0.0.1:${port}${path}" >/dev/null 2>&1; then
      pass "$name responding on 127.0.0.1:${port}${path}"
      ok=1
      break
    fi
  done
  [ "$ok" -eq 1 ] || warn "$name not confirmed on port $port"
}

probe "Unified local master" "$VIOLET_PORT"
probe "Legacy core" "$LEGACY_CORE_PORT"
probe "Local bridge" "$BRIDGE_PORT"
probe "Legacy interface" "$INTERFACE_PORT"

if [ -d "$VIOLET_ROOT" ]; then
  if grep -RIl --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=venv       -E 'SECRET_KEY=your-super-secret-key|postgres:postgres|DEBUG=true' "$VIOLET_ROOT" 2>/dev/null | head -n 1 | grep -q .; then
    fail "development/default credential markers found under VIOLET_ROOT"
  else
    pass "no known development credential markers detected"
  fi
fi

DB_PATH="${VIOLET_DB:-}"
if [ -n "$DB_PATH" ] && [ -f "$DB_PATH" ]; then
  python3 - "$DB_PATH" <<'PY'
import sqlite3, sys
db=sys.argv[1]
con=sqlite3.connect(f"file:{db}?mode=ro", uri=True)
row=con.execute("PRAGMA integrity_check").fetchone()
print("SQLITE", row[0])
raise SystemExit(0 if row and row[0]=="ok" else 1)
PY
  pass "SQLite integrity_check passed: $DB_PATH"
else
  warn "VIOLET_DB not set to a readable SQLite file; database integrity not certified"
fi

printf '\nSUMMARY failures=%s warnings=%s\nReceipt: %s\n' "$FAILURES" "$WARNINGS" "$RECEIPT"
if [ "$FAILURES" -gt 0 ]; then
  exit 2
fi
