# Atmopad Windows Desktop Notes

Atmopad is now structured as a web-first SvelteKit SPA plus a Tauri v2 desktop shell.

## Run Modes

Web preview:

```powershell
npm run dev
```

Desktop dev:

```powershell
npm run desktop:dev
```

Desktop build:

```powershell
npm run desktop:build
```

## Windows Prerequisites

`npm run tauri -- info` confirms:

- WebView2 is installed.
- Rust and Cargo are installed.
- Node/npm are installed.
- Visual Studio Build Tools with MSVC and Windows SDK are installed.

If this environment is rebuilt and MSVC disappears, install the Visual Studio 2022 Build Tools with the Visual C++ workload:

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools --source winget
```

In the installer, include:

- Desktop development with C++
- MSVC toolchain
- Windows SDK

After installation, re-run:

```powershell
npm run tauri -- info
npm run tauri -- build --debug --no-bundle
npm run desktop:build
```

The latest verified installer path is:

```text
src-tauri/target/release/bundle/nsis/Atmopad_0.0.1_x64-setup.exe
```

## Desktop Shell Contract

- `src-tauri/tauri.conf.json` owns the frameless Windows window through `decorations: false`.
- `src-tauri/capabilities/default.json` allows only the window operations used by the custom titlebar.
- `src/lib/desktop/window.ts` dynamically loads Tauri APIs only inside a Tauri runtime.
- `src/lib/components/DesktopTitlebar.svelte` renders only in Tauri, so the browser version keeps its current layout.
- `src-tauri/icons/icon.ico` is a generated Atmopad icon used by Windows resources.
