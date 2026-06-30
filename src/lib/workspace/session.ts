import type { PaneId, WorkspaceSnapshot } from './workspace';

interface PaneUpdate {
  contentJson: unknown;
  plainText: string;
  html: string;
}

interface SessionOptions {
  debounceMs?: number;
  save?: (workspace: WorkspaceSnapshot) => void | Promise<void>;
}

export function createWorkspaceSession(initialWorkspace: WorkspaceSnapshot, options: SessionOptions = {}) {
  let workspace = structuredClone(initialWorkspace);
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  const debounceMs = options.debounceMs ?? 500;

  function scheduleSave() {
    if (!options.save) return;
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(() => {
      void options.save?.(structuredClone(workspace));
    }, debounceMs);
  }

  return {
    getSnapshot(): WorkspaceSnapshot {
      return structuredClone(workspace);
    },

    replace(nextWorkspace: WorkspaceSnapshot) {
      workspace = structuredClone(nextWorkspace);
      scheduleSave();
    },

    updatePane(id: PaneId, update: PaneUpdate) {
      workspace = {
        ...workspace,
        activePane: id,
        panes: {
          ...workspace.panes,
          [id]: {
            ...workspace.panes[id],
            ...update,
            updatedAt: new Date().toISOString()
          }
        }
      };
      scheduleSave();
    },

    setSplitRatio(splitRatio: number) {
      workspace = {
        ...workspace,
        splitRatio
      };
      scheduleSave();
    },

    flushSave() {
      if (!options.save) return;
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      void options.save(structuredClone(workspace));
    }
  };
}
