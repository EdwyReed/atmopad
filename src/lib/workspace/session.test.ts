import { describe, expect, it, vi } from 'vitest';

import { createDefaultWorkspace } from './workspace';
import { createWorkspaceSession } from './session';

describe('workspace session', () => {
  it('updates only the edited pane and records the active pane', () => {
    const session = createWorkspaceSession(createDefaultWorkspace('2026-06-30T00:00:00.000Z'));

    session.updatePane('right', {
      contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
      plainText: 'Right side',
      html: '<p>Right side</p>'
    });

    const workspace = session.getSnapshot();
    expect(workspace.activePane).toBe('right');
    expect(workspace.panes.right.plainText).toBe('Right side');
    expect(workspace.panes.left.plainText).toBe('');
  });

  it('debounces saves for rapid pane updates', () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const session = createWorkspaceSession(createDefaultWorkspace('2026-06-30T00:00:00.000Z'), {
      save,
      debounceMs: 300
    });

    session.updatePane('left', { plainText: 'A', html: '<p>A</p>', contentJson: {} });
    session.updatePane('left', { plainText: 'AB', html: '<p>AB</p>', contentJson: {} });

    vi.advanceTimersByTime(299);
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        panes: expect.objectContaining({
          left: expect.objectContaining({ plainText: 'AB' })
        })
      })
    );

    vi.useRealTimers();
  });
});
