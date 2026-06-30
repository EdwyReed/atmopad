import { describe, expect, it } from 'vitest';

import {
  buildPaneExport,
  calculateTextMetrics,
  clampSplitRatio,
  createDefaultWorkspace,
  formatReadingTime
} from './workspace';

describe('workspace metrics', () => {
  it('counts words, characters, and reading time from visible text', () => {
    const metrics = calculateTextMetrics('soft rain\non glass');

    expect(metrics.words).toBe(4);
    expect(metrics.characters).toBe(17);
    expect(metrics.readingTime).toBe('00:00:01');
  });

  it('formats reading time at 200 words per minute', () => {
    expect(formatReadingTime(0)).toBe('00:00:00');
    expect(formatReadingTime(400)).toBe('00:02:00');
  });
});

describe('workspace state', () => {
  it('clamps the split ratio to keep both panes usable', () => {
    expect(clampSplitRatio(0.1)).toBe(0.25);
    expect(clampSplitRatio(0.9)).toBe(0.75);
    expect(clampSplitRatio(0.42)).toBe(0.42);
  });

  it('creates a two-pane workspace with quiet default settings', () => {
    const workspace = createDefaultWorkspace('2026-06-30T00:00:00.000Z');

    expect(workspace.version).toBe(1);
    expect(workspace.activePane).toBe('left');
    expect(workspace.splitRatio).toBe(0.5);
    expect(workspace.settings).toEqual({
      theme: 'garden-paper',
      soundEnabled: true,
      motionEnabled: true,
      countersVisible: true,
      focusMode: false,
      multiPanel: true
    });
    expect(workspace.panes.left.title).toBe('Left pad');
    expect(workspace.panes.right.title).toBe('Right pad');
  });
});

describe('pane exports', () => {
  it('builds plain text and html export payloads from a pane snapshot', () => {
    const workspace = createDefaultWorkspace('2026-06-30T00:00:00.000Z');
    const pane = {
      ...workspace.panes.left,
      plainText: 'A quiet note',
      html: '<p>A <strong>quiet</strong> note</p>'
    };

    expect(buildPaneExport(pane, 'txt')).toEqual({
      filename: 'left-pad.txt',
      mimeType: 'text/plain;charset=utf-8',
      content: 'A quiet note'
    });
    expect(buildPaneExport(pane, 'html')).toEqual({
      filename: 'left-pad.html',
      mimeType: 'text/html;charset=utf-8',
      content: '<p>A <strong>quiet</strong> note</p>'
    });
  });
});
