import { describe, expect, it, vi } from 'vitest';

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

  it('delegates controls inside Tauri', async () => {
    const appWindow = {
      minimize: vi.fn().mockResolvedValue(undefined),
      toggleMaximize: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined)
    };
    const controller = createDesktopWindowController({ hasTauri: true, appWindow });

    await expect(controller.minimize()).resolves.toBe(true);
    await expect(controller.toggleMaximize()).resolves.toBe(true);
    await expect(controller.close()).resolves.toBe(true);

    expect(appWindow.minimize).toHaveBeenCalledTimes(1);
    expect(appWindow.toggleMaximize).toHaveBeenCalledTimes(1);
    expect(appWindow.close).toHaveBeenCalledTimes(1);
  });
});
