# Violet Local Bridge

Violet Local Bridge is the controlled laptop execution layer for Violet Forge. It links the web Command Center to a user-owned Windows or macOS computer without placing passwords or unrestricted administrator credentials in the browser.

## What this build provides

- One-time pairing from the Violet Forge **Computer** page.
- Local agent token stored only on the paired computer.
- Live device heartbeat and health reporting.
- Bluetooth paired-device inventory and LAN/interface discovery.
- Terminal-command queue with explicit owner approval before local execution.
- Optional administrator elevation that still triggers the operating system's local permission prompt.
- `VioletBridge/Inbox` for files sent from the Command Center.
- `VioletBridge/Outbox` for files uploaded back to the Command Center.
- `/health` gateway verification plus local-agent heartbeat evidence.
- Windows scheduled-task installer and macOS LaunchAgent installer.

## Security model

The web application is the control plane; the laptop agent is the execution plane. A terminal command is not eligible for local execution until it has been approved in the owner-only Computer page. The local agent independently blocks a small set of catastrophic disk/system commands. Administrator work does not store a password: macOS uses the normal administrator authorization prompt and Windows uses a UAC elevation prompt.

Pairing codes are one-time and expire after 10 minutes. The bridge token returned after successful pairing is written to the local agent configuration and is not displayed again by the web app.

## Install on macOS

1. In Violet Forge, sign in as the owner and open **Computer**.
2. Select **Generate pairing code**.
3. In Terminal, from this repository branch, run:

```bash
cd violet-local-bridge
chmod +x install/install-macos.sh
./install/install-macos.sh --server https://violet-forge-1v1mkh.v2.appdeploy.ai --pair 123456
```

Replace `123456` with the current pairing code. The installer creates a LaunchAgent and starts the bridge at login.

Verify locally:

```bash
python3 "$HOME/Library/Application Support/VioletLocalBridge/bridge.py" status
```

Local folders:

```text
~/VioletBridge/Inbox
~/VioletBridge/Outbox
```

## Install on Windows

1. In Violet Forge, sign in as the owner and open **Computer**.
2. Select **Generate pairing code**.
3. Open PowerShell in this repository branch and run:

```powershell
cd violet-local-bridge
Set-ExecutionPolicy -Scope Process Bypass
.\install\install-windows.ps1 -Server 'https://violet-forge-1v1mkh.v2.appdeploy.ai' -Pair '123456'
```

Replace `123456` with the current pairing code. The installer creates a per-user scheduled task named `VioletLocalBridge`.

Verify locally:

```powershell
python "$env:LOCALAPPDATA\VioletLocalBridge\bridge.py" status
```

Local folders:

```text
%USERPROFILE%\VioletBridge\Inbox
%USERPROFILE%\VioletBridge\Outbox
```

## Command lifecycle

```text
Chat / Quick Action
      ↓
Command queued
      ↓
Shell or admin request → Awaiting owner approval
      ↓
Approved
      ↓
Local bridge fetches command
      ↓
OS executes locally
      ↓
Result + exit code returned
      ↓
Computer page receives live update
```

Health, discovery, and file-sync requests are non-destructive and may be queued without the terminal approval step. Shell commands always require explicit approval.

## File lifecycle

Files sent from the web UI are stored in the private app storage layer and delivered into the laptop Inbox by the local agent. Files placed in the local Outbox are uploaded on the next sync cycle. This build intentionally limits individual bridge transfers to 2 MB; larger project bundles should use the connected Drive/Dropbox/GitHub workflows or a later chunked-transfer extension.

## Current boundary

The repository contains the local execution agent and installers. It does not bypass macOS privacy controls, Windows UAC, Bluetooth pairing consent, enterprise device policies, or application-specific authorization. Those permissions remain controlled by the operating system and the connected service.