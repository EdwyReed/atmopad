import { beforeEach, describe, expect, it } from 'vitest';

import { createDefaultWorkspace } from '$lib/workspace/workspace';
import { clearWorkspace, loadWorkspace, saveWorkspace } from './storage';

describe('workspace storage', () => {
  beforeEach(async () => {
    await clearWorkspace();
  });

  it('returns null when no workspace has been saved', async () => {
    await expect(loadWorkspace()).resolves.toBeNull();
  });

  it('saves and loads the current workspace snapshot', async () => {
    const workspace = createDefaultWorkspace('2026-06-30T00:00:00.000Z');
    workspace.panes.left.plainText = 'Left garden note';
    workspace.activePane = 'right';
    workspace.splitRatio = 0.62;

    await saveWorkspace(workspace);

    await expect(loadWorkspace()).resolves.toMatchObject({
      activePane: 'right',
      splitRatio: 0.62,
      panes: {
        left: {
          plainText: 'Left garden note'
        }
      }
    });
  });

  it('normalizes older saved settings when loading a workspace snapshot', async () => {
    const workspace = createDefaultWorkspace('2026-06-30T00:00:00.000Z');
    const legacyWorkspace = {
      ...workspace,
      settings: {
        theme: workspace.settings.theme,
        soundEnabled: workspace.settings.soundEnabled,
        motionEnabled: workspace.settings.motionEnabled,
        countersVisible: workspace.settings.countersVisible,
        focusMode: workspace.settings.focusMode
      }
    };

    await saveWorkspace(legacyWorkspace as unknown as typeof workspace);

    await expect(loadWorkspace()).resolves.toMatchObject({
      settings: {
        multiPanel: true
      }
    });
  });

  it('clears the saved workspace snapshot', async () => {
    await saveWorkspace(createDefaultWorkspace('2026-06-30T00:00:00.000Z'));
    await clearWorkspace();

    await expect(loadWorkspace()).resolves.toBeNull();
  });
});
