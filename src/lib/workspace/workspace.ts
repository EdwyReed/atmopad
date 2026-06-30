export type PaneId = 'left' | 'right';
export type ThemeId = 'garden-paper' | 'moonlit';
export type ExportFormat = 'txt' | 'html';

export interface PaneSnapshot {
  id: PaneId;
  title: string;
  contentJson: unknown;
  plainText: string;
  html: string;
  updatedAt: string;
}

export interface WorkspaceSnapshot {
  version: 1;
  activePane: PaneId;
  splitRatio: number;
  panes: Record<PaneId, PaneSnapshot>;
  settings: {
    theme: ThemeId;
    soundEnabled: boolean;
    motionEnabled: boolean;
    countersVisible: boolean;
    focusMode: boolean;
    multiPanel: boolean;
  };
}

export interface TextMetrics {
  words: number;
  characters: number;
  readingTime: string;
}

export interface PaneExport {
  filename: string;
  mimeType: string;
  content: string;
}

const WORDS_PER_MINUTE = 200;
const MIN_SPLIT_RATIO = 0.25;
const MAX_SPLIT_RATIO = 0.75;

export function formatReadingTime(words: number): string {
  if (words <= 0) {
    return '00:00:00';
  }

  const seconds = Math.max(1, Math.round((words / WORDS_PER_MINUTE) * 60));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':');
}

export function calculateTextMetrics(text: string): TextMetrics {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  const words = normalized.length === 0 ? 0 : normalized.split(/\s+/).filter(Boolean).length;
  const characters = text.replace(/\r?\n/g, '').length;

  return {
    words,
    characters,
    readingTime: formatReadingTime(words)
  };
}

export function clampSplitRatio(ratio: number): number {
  return Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, ratio));
}

export function createDefaultWorkspace(now = new Date().toISOString()): WorkspaceSnapshot {
  return {
    version: 1,
    activePane: 'left',
    splitRatio: 0.5,
    panes: {
      left: createPane('left', 'Left pad', now),
      right: createPane('right', 'Right pad', now)
    },
    settings: {
      theme: 'garden-paper',
      soundEnabled: true,
      motionEnabled: true,
      countersVisible: true,
      focusMode: false,
      multiPanel: true
    }
  };
}

export function normalizeWorkspaceSnapshot(workspace: WorkspaceSnapshot): WorkspaceSnapshot {
  const defaults = createDefaultWorkspace();

  return {
    ...workspace,
    settings: {
      ...defaults.settings,
      ...workspace.settings
    }
  };
}

export function buildPaneExport(pane: PaneSnapshot, format: ExportFormat): PaneExport {
  const basename = pane.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (format === 'html') {
    return {
      filename: `${basename}.html`,
      mimeType: 'text/html;charset=utf-8',
      content: pane.html
    };
  }

  return {
    filename: `${basename}.txt`,
    mimeType: 'text/plain;charset=utf-8',
    content: pane.plainText
  };
}

function createPane(id: PaneId, title: string, now: string): PaneSnapshot {
  return {
    id,
    title,
    contentJson: {
      type: 'doc',
      content: [{ type: 'paragraph' }]
    },
    plainText: '',
    html: '<p></p>',
    updatedAt: now
  };
}
