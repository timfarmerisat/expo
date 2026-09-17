#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python3 -m py_compile agent/bridge.py agent/bridge_impl.py
bash -n install/install-macos.sh
python3 - <<'PY'
from agent.bridge_impl import blocked_command

assert blocked_command('rm -rf /')
assert blocked_command('shutdown /s /t 0')
assert not blocked_command('echo violet-local-bridge')
assert not blocked_command('python --version')
print('Violet Local Bridge verification passed.')
PY
