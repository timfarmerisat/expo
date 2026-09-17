#!/bin/bash
set -euo pipefail

SERVER=""
PAIR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --server) SERVER="${2:-}"; shift 2 ;;
    --pair) PAIR="${2:-}"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$SERVER" || -z "$PAIR" ]]; then
  echo "Usage: $0 --server https://your-violet-app --pair 123456" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is required. Install Python 3, then run this installer again." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_AGENT="$SCRIPT_DIR/../agent/bridge.py"
if [[ ! -f "$SOURCE_AGENT" ]]; then
  echo "Could not find $SOURCE_AGENT" >&2
  exit 1
fi

INSTALL_DIR="$HOME/Library/Application Support/VioletLocalBridge"
PLIST="$HOME/Library/LaunchAgents/com.somethingdifferent.violetlocalbridge.plist"
PYTHON="$(command -v python3)"
mkdir -p "$INSTALL_DIR" "$HOME/Library/LaunchAgents" "$HOME/VioletBridge/Inbox" "$HOME/VioletBridge/Outbox"
cp "$SOURCE_AGENT" "$INSTALL_DIR/bridge.py"
chmod 700 "$INSTALL_DIR/bridge.py"

"$PYTHON" "$INSTALL_DIR/bridge.py" pair --server "$SERVER" --code "$PAIR"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.somethingdifferent.violetlocalbridge</string>
  <key>ProgramArguments</key>
  <array>
    <string>$PYTHON</string>
    <string>$INSTALL_DIR/bridge.py</string>
    <string>run</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$INSTALL_DIR/launch-agent.out.log</string>
  <key>StandardErrorPath</key>
  <string>$INSTALL_DIR/launch-agent.err.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$UID" "$PLIST" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$UID" "$PLIST"
launchctl kickstart -k "gui/$UID/com.somethingdifferent.violetlocalbridge"

cat > "$INSTALL_DIR/violet-bridge" <<EOF
#!/bin/bash
exec "$PYTHON" "$INSTALL_DIR/bridge.py" "\$@"
EOF
chmod 700 "$INSTALL_DIR/violet-bridge"

echo ""
echo "Violet Local Bridge installed and started."
echo "Status: $INSTALL_DIR/violet-bridge status"
echo "Inbox:  $HOME/VioletBridge/Inbox"
echo "Outbox: $HOME/VioletBridge/Outbox"
echo "Logs:   $INSTALL_DIR/bridge.log"
echo ""
echo "Administrator commands will still show the normal macOS authorization prompt on this computer."
