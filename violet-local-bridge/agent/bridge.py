#!/usr/bin/env python3
"""Violet Local Bridge cross-platform execution agent.

Standard-library only. Pair once, then run as a per-user background service.
"""

from __future__ import annotations

import argparse
import base64
import json
import logging
import mimetypes
import os
import platform
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

VERSION = '1.0.0'
POLL_SECONDS = 5
HEARTBEAT_SECONDS = 20
FILE_SYNC_SECONDS = 15
MAX_TRANSFER_BYTES = 2_000_000
BLOCKED_COMMANDS = [
    re.compile(r'rm\s+-rf\s+/(?:\s|$)', re.I),
    re.compile(r'\bmkfs(?:\.|\s)', re.I),
    re.compile(r'\bdiskpart\b.*\bclean\b', re.I),
    re.compile(r'\bformat\s+[a-z]:', re.I),
    re.compile(r'\bdd\s+if=.*\sof=/dev/', re.I),
    re.compile(r'\bshutdown\b', re.I),
    re.compile(r'\breboot\b', re.I),
    re.compile(r'\bbcdedit\b', re.I),
    re.compile(r'\breg\s+delete\b', re.I),
]


def app_dir() -> Path:
    if sys.platform == 'darwin':
        return Path.home() / 'Library' / 'Application Support' / 'VioletLocalBridge'
    if os.name == 'nt':
        return Path(os.environ.get('LOCALAPPDATA', Path.home() / 'AppData' / 'Local')) / 'VioletLocalBridge'
    return Path.home() / '.violet-local-bridge'


def work_root() -> Path:
    return Path.home() / 'VioletBridge'


CONFIG_PATH = app_dir() / 'config.json'
LOG_PATH = app_dir() / 'bridge.log'
INBOX_DIR = work_root() / 'Inbox'
OUTBOX_DIR = work_root() / 'Outbox'
SENT_DIR = OUTBOX_DIR / 'Sent'


def ensure_dirs() -> None:
    for path in (app_dir(), INBOX_DIR, OUTBOX_DIR, SENT_DIR):
        path.mkdir(parents=True, exist_ok=True)


def configure_logging() -> None:
    ensure_dirs()
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(message)s',
        handlers=[logging.FileHandler(LOG_PATH, encoding='utf-8'), logging.StreamHandler(sys.stdout)],
    )


def load_config() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        raise RuntimeError(f'Bridge is not paired. Missing configuration: {CONFIG_PATH}')
    return json.loads(CONFIG_PATH.read_text(encoding='utf-8'))


def save_config(value: dict[str, Any]) -> None:
    ensure_dirs()
    CONFIG_PATH.write_text(json.dumps(value, indent=2), encoding='utf-8')
    try:
        CONFIG_PATH.chmod(0o600)
    except OSError:
        pass


def http_json(server: str, method: str, path: str, payload: dict[str, Any] | None = None, token: str = '') -> Any:
    body = json.dumps(payload).encode('utf-8') if payload is not None else None
    request = urllib.request.Request(server.rstrip('/') + path, data=body, method=method)
    request.add_header('Content-Type', 'application/json')
    request.add_header('User-Agent', f'VioletLocalBridge/{VERSION}')
    if token:
        request.add_header('x-violet-bridge-token', token)
    try:
        with urllib.request.urlopen(request, timeout=40) as response:
            raw = response.read().decode('utf-8')
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'HTTP {exc.code}: {detail[:500]}') from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f'Network error: {exc.reason}') from exc


def run_text(command: list[str], timeout: int = 25) -> str:
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=timeout, check=False)
        return ((result.stdout or '') + ('\n' + result.stderr if result.stderr else '')).strip()
    except (OSError, subprocess.TimeoutExpired) as exc:
        return f'Unavailable: {exc}'


def total_memory_bytes() -> int:
    if sys.platform == 'darwin':
        output = run_text(['sysctl', '-n', 'hw.memsize'])
        return int(output) if output.isdigit() else 0
    if os.name == 'nt':
        output = run_text(['powershell', '-NoProfile', '-Command', '(Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize'])
        try:
            return int(float(output.strip())) * 1024
        except ValueError:
            return 0
    try:
        for line in Path('/proc/meminfo').read_text(encoding='utf-8').splitlines():
            if line.startswith('MemTotal:'):
                return int(line.split()[1]) * 1024
    except OSError:
        pass
    return 0


def battery_summary() -> str:
    if sys.platform == 'darwin':
        output = run_text(['pmset', '-g', 'batt'])
        match = re.search(r'(\d+)%', output)
        return f'{match.group(1)}%' if match else 'Unknown'
    if os.name == 'nt':
        output = run_text(['powershell', '-NoProfile', '-Command', '$b=Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue; if($b){$b.EstimatedChargeRemaining}else{"AC"}'])
        return f'{output.strip()}%' if output.strip().isdigit() else output.strip() or 'AC / unknown'
    return 'Unknown'


def bluetooth_summary() -> dict[str, Any]:
    if sys.platform == 'darwin':
        output = run_text(['system_profiler', 'SPBluetoothDataType'], timeout=35)
        state_match = re.search(r'State:\s*(\w+)', output)
        connected = len(re.findall(r'Connected:\s*Yes', output, flags=re.I))
        return {'bluetooth_state': state_match.group(1) if state_match else 'Unknown', 'bluetooth_connected_devices': connected}
    if os.name == 'nt':
        output = run_text([
            'powershell', '-NoProfile', '-Command',
            'Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue | Select-Object FriendlyName,Status | ConvertTo-Json -Compress',
        ], timeout=30)
        try:
            parsed = json.loads(output) if output else []
            devices = parsed if isinstance(parsed, list) else [parsed]
            return {
                'bluetooth_state': 'Available' if devices else 'No devices reported',
                'bluetooth_devices': len(devices),
                'bluetooth_ok_devices': sum(1 for item in devices if str(item.get('Status', '')).lower() == 'ok'),
            }
        except json.JSONDecodeError:
            return {'bluetooth_state': 'Unknown', 'bluetooth_devices': 0}
    return {'bluetooth_state': 'Unsupported on this OS'}


def health_report() -> dict[str, Any]:
    ensure_dirs()
    disk = shutil.disk_usage(Path.home())
    try:
        addresses = sorted({address for address in socket.gethostbyname_ex(socket.gethostname())[2] if address and not address.startswith('127.')})
    except OSError:
        addresses = []
    report: dict[str, Any] = {
        'os': f'{platform.system()} {platform.release()}',
        'machine': platform.machine(),
        'hostname': socket.gethostname(),
        'cpu_count': os.cpu_count() or 0,
        'memory_gb': round(total_memory_bytes() / (1024 ** 3), 1) if total_memory_bytes() else 0,
        'disk_free_gb': round(disk.free / (1024 ** 3), 1),
        'disk_total_gb': round(disk.total / (1024 ** 3), 1),
        'battery': battery_summary(),
        'local_addresses': ', '.join(addresses) if addresses else 'Not reported',
        'inbox': str(INBOX_DIR),
        'outbox': str(OUTBOX_DIR),
    }
    if hasattr(os, 'getloadavg'):
        try:
            report['load_1m'] = round(os.getloadavg()[0], 2)
        except OSError:
            pass
    report.update(bluetooth_summary())
    return report


def discovery_report() -> dict[str, Any]:
    if sys.platform == 'darwin':
        interfaces = run_text(['/sbin/ifconfig'])
        arp = run_text(['/usr/sbin/arp', '-a'])
    elif os.name == 'nt':
        interfaces = run_text(['ipconfig', '/all'])
        arp = run_text(['arp', '-a'])
    else:
        interfaces = run_text(['ip', 'addr'])
        arp = run_text(['ip', 'neigh'])
    bluetooth = bluetooth_summary()
    return {
        **bluetooth,
        'lan_interfaces': interfaces[:5000],
        'lan_neighbors': arp[:5000],
    }


def blocked_command(command: str) -> bool:
    return any(pattern.search(command) for pattern in BLOCKED_COMMANDS)


def run_elevated_macos(command: str) -> tuple[int, str]:
    escaped = command.replace('\\', '\\\\').replace('"', '\\"')
    result = subprocess.run(
        ['osascript', '-e', f'do shell script "{escaped}" with administrator privileges'],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    output = ((result.stdout or '') + ('\n' + result.stderr if result.stderr else '')).strip()
    return result.returncode, output


def run_elevated_windows(command: str) -> tuple[int, str]:
    with tempfile.TemporaryDirectory(prefix='violet-admin-') as temp:
        root = Path(temp)
        script = root / 'elevated.ps1'
        output_file = root / 'output.txt'
        code_file = root / 'exit.txt'
        script.write_text(
            "$ErrorActionPreference='Continue'\n"
            f"$output='{str(output_file).replace("'", "''")}'\n"
            f"$codeFile='{str(code_file).replace("'", "''")}'\n"
            "try {\n"
            f"  & {{ {command} }} *>&1 | Out-File -FilePath $output -Encoding utf8\n"
            "  $code = if($LASTEXITCODE -is [int]) { $LASTEXITCODE } else { 0 }\n"
            "} catch { $_ | Out-File -FilePath $output -Encoding utf8; $code=1 }\n"
            "Set-Content -Path $codeFile -Value $code\n",
            encoding='utf-8',
        )
        outer = (
            "$p=Start-Process powershell.exe -Verb RunAs -Wait -PassThru "
            f"-ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File','{str(script).replace("'", "''")}'); exit $p.ExitCode"
        )
        launched = subprocess.run(['powershell', '-NoProfile', '-Command', outer], capture_output=True, text=True, timeout=240, check=False)
        output = output_file.read_text(encoding='utf-8', errors='replace') if output_file.exists() else (launched.stderr or launched.stdout or 'Administrator prompt was cancelled or returned no output.')
        try:
            exit_code = int(code_file.read_text(encoding='utf-8').strip()) if code_file.exists() else launched.returncode
        except ValueError:
            exit_code = launched.returncode
        return exit_code, output.strip()


def run_shell(command: str, requires_admin: bool) -> tuple[int, str]:
    if blocked_command(command):
        return 126, 'Blocked locally by the Violet Local Bridge catastrophic-command safety gate.'
    try:
        if requires_admin and sys.platform == 'darwin':
            return run_elevated_macos(command)
        if requires_admin and os.name == 'nt':
            return run_elevated_windows(command)
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=120, check=False)
        output = ((result.stdout or '') + ('\n' + result.stderr if result.stderr else '')).strip()
        return result.returncode, output[:16000]
    except subprocess.TimeoutExpired:
        return 124, 'Command exceeded the 120-second local execution limit.'
    except OSError as exc:
        return 1, f'Local execution failed: {exc}'


def download_file(url: str, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=60) as response, target.open('wb') as handle:
        shutil.copyfileobj(response, handle)


def sync_inbox(config: dict[str, Any]) -> list[str]:
    response = http_json(config['server'], 'GET', '/api/bridge/files', token=config['token'])
    delivered: list[str] = []
    for item in response.get('files', []):
        name = Path(str(item.get('name', 'file'))).name
        url = str(item.get('url', ''))
        if not url:
            continue
        target = INBOX_DIR / name
        download_file(url, target)
        http_json(config['server'], 'POST', f"/api/bridge/files/{item['id']}/delivered", {}, token=config['token'])
        delivered.append(str(target))
    return delivered


def upload_outbox(config: dict[str, Any]) -> list[str]:
    uploaded: list[str] = []
    for path in OUTBOX_DIR.iterdir():
        if not path.is_file() or path.name.startswith('.'):
            continue
        size = path.stat().st_size
        if size > MAX_TRANSFER_BYTES:
            logging.warning('Skipping oversized outbox file: %s', path)
            continue
        content = base64.b64encode(path.read_bytes()).decode('ascii')
        content_type = mimetypes.guess_type(path.name)[0] or 'text/plain'
        try:
            http_json(
                config['server'],
                'POST',
                '/api/bridge/files/outbox',
                {'name': path.name, 'content': content, 'contentType': content_type},
                token=config['token'],
            )
            destination = SENT_DIR / path.name
            if destination.exists():
                destination = SENT_DIR / f'{int(time.time())}-{path.name}'
            path.replace(destination)
            uploaded.append(str(destination))
        except RuntimeError as exc:
            logging.warning('Outbox upload failed for %s: %s', path, exc)
    return uploaded


def heartbeat(config: dict[str, Any], include_discovery: bool = False) -> None:
    payload: dict[str, Any] = {'version': VERSION, 'health': health_report()}
    if include_discovery:
        payload['discovery'] = discovery_report()
    http_json(config['server'], 'POST', '/api/bridge/heartbeat', payload, token=config['token'])


def execute_command(config: dict[str, Any], command: dict[str, Any]) -> None:
    kind = str(command.get('kind', ''))
    output = ''
    exit_code = 0
    if kind == 'health':
        report = health_report()
        heartbeat(config)
        output = json.dumps(report, indent=2)
    elif kind == 'discovery':
        discovery = discovery_report()
        http_json(config['server'], 'POST', '/api/bridge/heartbeat', {'version': VERSION, 'health': health_report(), 'discovery': discovery}, token=config['token'])
        output = json.dumps(discovery, indent=2)
    elif kind == 'sync_files':
        received = sync_inbox(config)
        sent = upload_outbox(config)
        output = json.dumps({'received': received, 'sent': sent}, indent=2)
    elif kind == 'shell':
        exit_code, output = run_shell(str(command.get('command', '')), bool(command.get('requiresAdmin', False)))
    else:
        exit_code = 2
        output = f'Unsupported command kind: {kind}'
    http_json(
        config['server'],
        'POST',
        f"/api/bridge/commands/{command['id']}/result",
        {'output': output[:16000], 'exitCode': exit_code},
        token=config['token'],
    )


def pair(server: str, code: str) -> None:
    ensure_dirs()
    payload = {
        'pairingCode': code,
        'name': socket.gethostname(),
        'os': f'{platform.system()} {platform.release()}',
        'version': VERSION,
    }
    response = http_json(server, 'POST', '/api/bridge/register', payload)
    token = str(response.get('token', ''))
    computer_id = str(response.get('computerId', ''))
    if not token or not computer_id:
        raise RuntimeError('Pairing response did not include bridge credentials.')
    save_config({'server': server.rstrip('/'), 'token': token, 'computer_id': computer_id, 'version': VERSION})
    print(f'Paired {socket.gethostname()} as {computer_id}.')
    print(f'Inbox:  {INBOX_DIR}')
    print(f'Outbox: {OUTBOX_DIR}')


def status() -> None:
    ensure_dirs()
    print(f'Version: {VERSION}')
    print(f'Config:  {CONFIG_PATH}')
    print(f'Log:     {LOG_PATH}')
    print(f'Inbox:   {INBOX_DIR}')
    print(f'Outbox:  {OUTBOX_DIR}')
    if not CONFIG_PATH.exists():
        print('State:   Not paired')
        return
    config = load_config()
    print(f"Server:  {config.get('server', 'Unknown')}")
    try:
        heartbeat(config)
        print('State:   Paired and heartbeat accepted')
    except Exception as exc:  # status should explain rather than crash
        print(f'State:   Paired, heartbeat failed: {exc}')


def run_loop() -> None:
    configure_logging()
    config = load_config()
    logging.info('Violet Local Bridge %s starting for %s', VERSION, socket.gethostname())
    last_heartbeat = 0.0
    last_file_sync = 0.0
    discovery_counter = 0
    while True:
        try:
            now_seconds = time.time()
            if now_seconds - last_heartbeat >= HEARTBEAT_SECONDS:
                discovery_counter += 1
                heartbeat(config, include_discovery=(discovery_counter % 6 == 0))
                last_heartbeat = now_seconds
            response = http_json(config['server'], 'GET', '/api/bridge/commands', token=config['token'])
            for command in response.get('commands', []):
                logging.info('Executing approved command %s (%s)', command.get('id'), command.get('kind'))
                try:
                    execute_command(config, command)
                except Exception as exc:
                    logging.exception('Command execution failed')
                    try:
                        http_json(config['server'], 'POST', f"/api/bridge/commands/{command['id']}/result", {'output': f'Agent error: {exc}', 'exitCode': 1}, token=config['token'])
                    except Exception:
                        logging.exception('Could not report command failure')
            if now_seconds - last_file_sync >= FILE_SYNC_SECONDS:
                sync_inbox(config)
                upload_outbox(config)
                last_file_sync = now_seconds
        except KeyboardInterrupt:
            logging.info('Bridge stopped by user')
            return
        except Exception as exc:
            logging.warning('Bridge cycle failed: %s', exc)
        time.sleep(POLL_SECONDS)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Violet Local Bridge')
    sub = parser.add_subparsers(dest='action', required=True)
    pair_parser = sub.add_parser('pair', help='Pair this computer using a one-time code')
    pair_parser.add_argument('--server', required=True)
    pair_parser.add_argument('--code', required=True)
    sub.add_parser('run', help='Run the local bridge service loop')
    sub.add_parser('status', help='Show local bridge status and verify heartbeat')
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        if args.action == 'pair':
            pair(args.server, args.code)
        elif args.action == 'run':
            run_loop()
        elif args.action == 'status':
            status()
        return 0
    except Exception as exc:
        print(f'Violet Local Bridge error: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
