# AGENTS.md

## Project Overview

My Player is a macOS-first local music player built with Electron, React, and TypeScript.

Current scope:

1. macOS is the only actively supported development and verification target.
2. Windows and Linux should remain future-compatible in architecture, but do not optimize for them yet.
3. The app is local-first. Do not add online music services, accounts, telemetry, or cloud sync unless explicitly requested.
4. The current feature level is a basic local audio playback loop: select local audio files, show a list/queue, and play them through a controlled media protocol.

Key docs:

1. `docs/architecture.md`
2. `docs/roadmap.md`
3. `README.md`

`start.md` is local planning context and is intentionally ignored by Git.

## Tech Stack

1. Desktop runtime: Electron
2. UI: React
3. Language: TypeScript
4. Build tooling: electron-vite
5. Packaging: electron-builder
6. Unit tests: Vitest
7. E2E test runner: Playwright
8. Formatting: Prettier
9. Linting: ESLint
10. Package manager: npm

Node/npm expectations:

1. Node.js `>=24.17.0`
2. npm `>=11.13.0`
3. Use `.nvmrc` with `nvm use` before installing or running commands.

## Common Commands

Install dependencies:

```bash
npm install
```

Run the app in development:

```bash
npm run dev
```

Run all normal checks:

```bash
npm run check
```

Individual checks:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

macOS package directory build:

```bash
npm run pack:mac
```

macOS distributable build:

```bash
npm run build:mac
```

## Source Layout

Important directories:

1. `src/main`: Electron main process, system APIs, IPC handlers, file access, protocol handlers.
2. `src/preload`: narrow bridge exposed to the renderer through `contextBridge`.
3. `src/renderer`: React UI.
4. `src/shared`: shared types, contracts, and pure helpers.
5. `tests/unit`: Vitest unit tests.
6. `docs`: architecture and roadmap documents.

Rules:

1. `src/shared` must stay pure. Do not import Electron, Node filesystem APIs, or renderer-only packages there.
2. `src/renderer` must not access Node.js or Electron main-process APIs directly.
3. Renderer-to-main communication must go through typed preload APIs.
4. Do not expose raw `ipcRenderer` to the renderer.
5. Keep IPC channel names and shared request/response types in `src/shared/contracts`.

## Current Playback Design

The renderer receives `LocalAudioTrack` objects through `window.myPlayer.selectAudioFiles()`.

Playback uses the custom `my-player-media://` protocol. The main process maps selected track IDs to local files and serves them with Range support so Chromium audio playback can seek and stream correctly.

When changing playback:

1. Preserve renderer isolation from raw filesystem paths where practical.
2. Keep the media protocol capable of byte-range responses.
3. Add unit tests for pure parsing, MIME, path, and queue helpers.
4. Do not introduce FFmpeg yet unless the task explicitly asks for it.

## UI Guidance

This is a desktop music player, not a marketing website.

1. Keep UI dense, scannable, and stable.
2. Avoid oversized hero layouts or decorative-only sections.
3. Prefer actual controls over explanatory in-app text.
4. Use lucide-react icons for buttons when available.
5. Keep cards modest and avoid nested cards.
6. Ensure long song titles, file names, and list cells truncate cleanly.

## Testing Expectations

Before finishing code changes, run at least:

```bash
npm run check
```

For focused pure helper work, unit tests may be run first:

```bash
npm run test:unit
```

If a change touches packaging, main process startup, Electron protocol behavior, or native dependencies, also consider:

```bash
npm run pack:mac
```

## Git And Commit Rules

Follow these commit rules:

1. Never add `Co-Authored-By` lines.
2. Commit title must use a conventional commit prefix such as `feat`, `fix`, `docs`, `chore`, or `refactor`, followed by a concise Chinese description.
3. Commit body must use a numbered `1. 2. 3.` list for detailed changes.

Examples:

```text
feat: 支持本地音频基础播放

1. 新增本地音频文件选择 IPC 和受控媒体协议。
2. 实现歌曲列表、播放队列和基础播放控制。
3. 补充音频文件识别和媒体 Range 响应测试。
```

## Files And Generated Artifacts

Do not commit:

1. `node_modules`
2. `out`
3. `dist`
4. `.eslintcache`
5. `playwright-report`
6. `test-results`
7. `start.md`

Generated build artifacts should remain ignored unless the user explicitly asks otherwise.

## Current Development Priorities

Work in small slices. Avoid implementing the full roadmap in one pass.

Near-term useful slices:

1. Improve playback controls such as volume and progress.
2. Add simple queue behavior improvements.
3. Display duration after metadata loads.
4. Persist lightweight playback preferences.
5. Later, add SQLite-backed library scanning.

SQLite, directory scanning, playlists, metadata extraction, and FFmpeg integration are later phases unless explicitly requested.
