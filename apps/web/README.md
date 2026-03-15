# MightyHQ Unified App (`apps/shortcut`)

Single React codebase for both Electron desktop and browser dashboard/launcher.

## Modes

- **Launcher** (`Ctrl+O` / `Cmd+O`): compact command palette window (`#/launcher`)
- **Dashboard**: full app experience (`#/dashboard/*`)
- **Legacy extension popup**: compatibility mode (`#/extension`)

## Development

From repo root:

- `pnpm dev` → start extension app (Electron + renderer via electron-vite)
- `pnpm dev:dashboard` → start browser mode (same app/components) on web
- `pnpm --filter @mighty/shortcut typecheck` → run TS checks
- `pnpm --filter @mighty/shortcut lint` → lint renderer/main sources
- `pnpm --filter @mighty/shortcut build` → production build
- `pnpm --filter @mighty/shortcut build:web` → browser deploy build (`dist-web/`)

## Auth + Sync

Set these env vars for Supabase auth and cross-device sync:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

When configured:

- dashboard/launcher routes require sign-in
- data sync is user-scoped (`user_id`) for snippets/prompts/categories/quick-links/pins
- browser and Electron clients sync through the same Supabase tables

## Where Things Live

- `electron/main.js`: windows, shortcuts, tray, IPC handlers
- `electron/preload.js`: secure bridge exposing `window.mightyhq.*`
- `vite.web.config.ts`: web-mode build/dev config for browser deployment
- `src/pages/LauncherPage.tsx`: compact launcher UX
- `src/pages/ExtensionsPage.tsx`: built-in + custom extension management
- `src/contexts/AuthContext.tsx`: shared Supabase auth state
- `src/plugins/`: built-in plugin modules (calculator, color picker)
- `src/extensions/`: extension modules with `manifest.json` + `index.tsx`

## Extension Manifest Workflow

Use the Raycast-style manifest pattern used in `raycastclone/extensions/*/manifest.json`.

For each new built-in extension:

1. Create `src/extensions/<name>/manifest.json`
2. Create `src/extensions/<name>/index.tsx` exporting a `PluginManifest`
3. Register in `src/extensions/index.ts`

Keep extension metadata in `manifest.json`, and map it into runtime command/panel config in `index.tsx`.

## Plugin vs Extension Rule

- Place **plugins** in `src/plugins/` (UI-centric tools like calculator/color picker)
- Place **extensions** in `src/extensions/` (manifest-driven command packs)
