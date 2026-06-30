# Windows Tauri Desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current SvelteKit Atmopad MVP into a Windows-first Tauri desktop app with a custom glass titlebar and no backend dependency.

**Architecture:** Keep the existing SvelteKit SPA as the UI/runtime surface and embed its static `build/` output in Tauri. Add a thin desktop adapter layer for window controls so the web preview keeps working while the packaged Windows app gets native minimize, maximize, close, and drag behavior.

**Tech Stack:** SvelteKit static SPA, Tiptap/ProseMirror, IndexedDB, Tauri v2, Rust, WebView2.

---

## File Structure

- `package.json`: add Tauri scripts and dependencies.
- `vite.config.ts`: pin the dev server to `127.0.0.1:5173` with `strictPort` so Tauri always opens the expected frontend.
- `src-tauri/tauri.conf.json`: define the Windows desktop app window, static frontend path, dev URL, bundle metadata, and `decorations: false`.
- `src-tauri/Cargo.toml`: Rust package and Tauri dependency manifest.
- `src-tauri/build.rs`: Tauri build hook.
- `src-tauri/src/main.rs`: minimal Tauri app entrypoint.
- `src-tauri/capabilities/default.json`: allow only the window APIs used by the custom titlebar.
- `src/lib/desktop/window.ts`: runtime-safe desktop window adapter used by Svelte components.
- `src/lib/desktop/window.test.ts`: verifies web fallback behavior and adapter guards.
- `src/lib/components/DesktopTitlebar.svelte`: custom glass titlebar with drag region and window controls.
- `src/lib/components/AtmoIcon.svelte`: add soft window-control icons.
- `src/routes/+page.svelte`: mount the desktop titlebar and reserve layout space only inside Tauri.

## Task 1: Tauri Project Scaffold

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/build.rs`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/capabilities/default.json`

- [x] **Step 1: Install desktop packages**

Run:

```powershell
npm install @tauri-apps/api@latest
npm install -D @tauri-apps/cli@latest
```

Expected: `package.json` and `package-lock.json` include Tauri packages.

- [x] **Step 2: Add package scripts**

Set scripts to include:

```json
"tauri": "tauri",
"desktop:dev": "tauri dev",
"desktop:build": "tauri build"
```

- [x] **Step 3: Pin Vite dev server**

Add this server block:

```ts
server: {
  host: '127.0.0.1',
  port: 5173,
  strictPort: true
}
```

- [x] **Step 4: Add minimal Tauri config**

Create `src-tauri/tauri.conf.json` with:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Atmopad",
  "version": "0.0.1",
  "identifier": "studio.atmopad.desktop",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://127.0.0.1:5173",
    "frontendDist": "../build"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Atmopad",
        "width": 1280,
        "height": 820,
        "minWidth": 900,
        "minHeight": 620,
        "resizable": true,
        "decorations": false,
        "shadow": true,
        "center": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "windows": {
      "webviewInstallMode": {
        "type": "embedBootstrapper"
      }
    }
  }
}
```

- [x] **Step 5: Add Rust shell**

Create:

```toml
[package]
name = "atmopad"
version = "0.0.1"
description = "A calm atmospheric desktop notepad."
authors = ["Atmopad"]
license = ""
repository = ""
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

```rust
fn main() {
    tauri_build::build()
}
```

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Atmopad");
}

fn main() {
    run();
}
```

- [x] **Step 6: Add narrow window permissions**

Create `src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-capability",
  "description": "Window controls for the main Atmopad desktop window.",
  "windows": ["main"],
  "permissions": [
    "core:window:default",
    "core:window:allow-close",
    "core:window:allow-minimize",
    "core:window:allow-toggle-maximize",
    "core:window:allow-start-dragging"
  ]
}
```

## Task 2: Runtime-Safe Window Adapter

**Files:**
- Create: `src/lib/desktop/window.ts`
- Create: `src/lib/desktop/window.test.ts`

- [x] **Step 1: Write fallback tests**

Test:

```ts
import { describe, expect, it } from 'vitest';
import { createDesktopWindowController } from './window';

describe('desktop window controller', () => {
  it('reports inactive outside Tauri', () => {
    const controller = createDesktopWindowController({ hasTauri: false });
    expect(controller.isDesktop).toBe(false);
  });

  it('does not throw when controls are used outside Tauri', async () => {
    const controller = createDesktopWindowController({ hasTauri: false });
    await expect(controller.minimize()).resolves.toBe(false);
    await expect(controller.toggleMaximize()).resolves.toBe(false);
    await expect(controller.close()).resolves.toBe(false);
  });
});
```

- [x] **Step 2: Implement adapter**

Expose:

```ts
export interface DesktopWindowController {
  isDesktop: boolean;
  minimize(): Promise<boolean>;
  toggleMaximize(): Promise<boolean>;
  close(): Promise<boolean>;
}
```

Implementation must dynamically import `@tauri-apps/api/window` only after detecting `window.__TAURI_INTERNALS__` so browser preview/tests do not call Tauri APIs.

## Task 3: Custom Glass Titlebar

**Files:**
- Create: `src/lib/components/DesktopTitlebar.svelte`
- Modify: `src/lib/components/AtmoIcon.svelte`
- Modify: `src/routes/+page.svelte`
- Modify: `src/routes/page.test.ts`

- [x] **Step 1: Add soft control icons**

Add icon names:

```ts
'window-minimize' | 'window-maximize' | 'window-close'
```

They should match the app's existing cozy line-icon language.

- [x] **Step 2: Build titlebar component**

The component must:

- render only when the desktop adapter reports `isDesktop`;
- expose a drag region with `data-tauri-drag-region`;
- keep buttons outside the drag region;
- use accessible labels;
- visually match Atmopad: soft glass, low opacity, compact, no heavy native-looking chrome.

- [x] **Step 3: Mount titlebar in app shell**

Place `<DesktopTitlebar />` above `<main class="app-shell">`.

When titlebar is visible, body receives a class or CSS variable that slightly shifts the app shell down without changing the web preview layout.

## Task 4: Verification

**Files:**
- No new files unless fixes are required.

- [x] **Step 1: Type and component checks**

Run:

```powershell
npm run check
```

Expected: exit code `0`.

- [x] **Step 2: Unit tests**

Run:

```powershell
npm test -- --run
```

Expected: all tests pass.

- [x] **Step 3: Web build**

Run:

```powershell
npm run build
```

Expected: static SvelteKit build succeeds and writes `build/`.

- [x] **Step 4: Tauri sanity check**

Run:

```powershell
npm run tauri -- info
```

Expected: Tauri reports project, Rust, Node, and WebView2 information.

- [x] **Step 5: Desktop dev smoke when possible**

Run:

```powershell
npm run desktop:dev
```

Expected: Windows app opens with no native titlebar, shows the custom glass titlebar, and the minimize/maximize/close buttons work.

If this cannot be completed in an unattended session because it opens an interactive window, stop after `tauri info` and leave the smoke check for a visible manual pass.

Current status: Visual Studio Build Tools were installed through `winget`, `npm run tauri -- build --debug --no-bundle` passes, `npm run desktop:build` produces `src-tauri/target/release/bundle/nsis/Atmopad_0.0.1_x64-setup.exe`, and a short release executable smoke test opens an `Atmopad` window.

## Current Scope Boundary

This plan intentionally does not add native file dialogs, native filesystem storage, global shortcuts, tray, installer branding icons, auto-updates, document tabs, cloud sync, encryption, or OS-level theme syncing. Those are desktop product tasks after the Windows shell is stable.
