export type WordpressSyncResult = {
  imported: number;
  updated: number;
  skipped: number;
  lastSyncedAt: string;
};

export type WordpressSyncStatus = {
  lastSyncedAt: string | null;
  lastImported: number;
  lastUpdated: number;
  lastSkipped: number;
};

export type WordpressSyncLogEntry = {
  id: string;
  startedAt: string;
  finishedAt: string;
  imported: number;
  updated: number;
  skippedUnchanged: number;
  missingSku: number;
  missingUnit: number;
  missingCategory: number;
  triggeredByName: string | null;
};
