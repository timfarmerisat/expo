# Violet Intelligence Command Center

A responsive, standalone front end for the Violet 1011 system. It includes the 77-item innovation registry, local assistant guidance, tasks, activity, provider status, and a browser-local asset vault.

## Start

Requirements: Node.js 20 or newer. There are no third-party packages to install.

```sh
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). To use another port, run `PORT=5000 npm start`.

## What works in this build

- The six workspace destinations, command search, keyboard shortcut, local assistant, text-to-speech/dictation where the browser supports them, task board, notifications, preferences, and activity log.
- Exactly 77 catalogued front-end innovations, searchable and grouped by department.
- File storage, checksums, duplicate checks, downloads, and recoverable deletion inside this browser using IndexedDB. Files are not sent to a server.
- A real local `GET /api/health` endpoint and an offline-cached app shell.
- Export and validated restore for local workspace records.
- A Node container recipe that listens on the container interface and runs as the unprivileged `node` user.

## Runtime truth

The product opens in **Local Demo** mode. The local assistant is a deterministic guide over the installed feature catalog and local browser state; it is not a connected language model. Google Drive, Microsoft, Dropbox, GitHub, Bluetooth/Wi-Fi device bridge, and remote model provider cards are **not connected**. The interface explains their setup needs and does not collect credentials. No production account, backend database, OAuth, or remote AI service is configured by this source bundle.

Browser-local tasks, preferences, and file bytes stay in that browser profile. Clearing browser storage removes them. Back up tasks and preferences from the workspace before moving to another device. If you activate dictation, the browser’s speech-recognition service may use its own online processing; review the browser’s permission and privacy notices. Typing remains local to this app.

## Verify

```sh
npm test
```

Tests validate the 77-item registry and make an HTTP request to the real local health route.

## Rendering

The interface uses scalable HTML, CSS, and SVG with responsive layouts for desktop and mobile. It includes no externally loaded fonts or runtime assets.
