export interface DesktopWindowController {
  isDesktop: boolean;
  minimize(): Promise<boolean>;
  toggleMaximize(): Promise<boolean>;
  close(): Promise<boolean>;
}

interface TauriWindowLike {
  minimize(): Promise<void>;
  toggleMaximize(): Promise<void>;
  close(): Promise<void>;
}

interface ControllerOptions {
  hasTauri?: boolean;
  appWindow?: TauriWindowLike;
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);
}

export function createDesktopWindowController(options: ControllerOptions = {}): DesktopWindowController {
  const hasTauri = options.hasTauri ?? isTauriRuntime();
  let appWindow = options.appWindow;

  async function resolveWindow(): Promise<TauriWindowLike | null> {
    if (!hasTauri) return null;
    if (appWindow) return appWindow;

    try {
      const tauriWindow = await import('@tauri-apps/api/window');
      appWindow = tauriWindow.getCurrentWindow();
      return appWindow;
    } catch {
      return null;
    }
  }

  async function runWindowAction(action: (window: TauriWindowLike) => Promise<void>): Promise<boolean> {
    const currentWindow = await resolveWindow();
    if (!currentWindow) return false;

    await action(currentWindow);
    return true;
  }

  return {
    isDesktop: hasTauri,
    minimize: () => runWindowAction((currentWindow) => currentWindow.minimize()),
    toggleMaximize: () => runWindowAction((currentWindow) => currentWindow.toggleMaximize()),
    close: () => runWindowAction((currentWindow) => currentWindow.close())
  };
}
