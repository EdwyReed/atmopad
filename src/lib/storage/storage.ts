import { openDB, type DBSchema } from 'idb';

import { normalizeWorkspaceSnapshot, type WorkspaceSnapshot } from '$lib/workspace/workspace';

const DB_NAME = 'atmopad';
const DB_VERSION = 1;
const STORE_NAME = 'workspace';
const CURRENT_WORKSPACE_KEY = 'current';

interface AtmopadDb extends DBSchema {
  workspace: {
    key: string;
    value: WorkspaceSnapshot;
  };
}

export async function loadWorkspace(): Promise<WorkspaceSnapshot | null> {
  const db = await getDb();
  const workspace = await db.get(STORE_NAME, CURRENT_WORKSPACE_KEY);
  return workspace ? normalizeWorkspaceSnapshot(workspace) : null;
}

export async function saveWorkspace(workspace: WorkspaceSnapshot): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, workspace, CURRENT_WORKSPACE_KEY);
}

export async function clearWorkspace(): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, CURRENT_WORKSPACE_KEY);
}

function getDb() {
  return openDB<AtmopadDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    }
  });
}
