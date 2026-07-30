import { randomUUID } from 'crypto';

import { getData, loadDatabase, saveDatabase } from './database';
import type { CleanupRecord } from './types';

export async function saveCleanup(record: Omit<CleanupRecord, 'id'>): Promise<CleanupRecord> {
  await loadDatabase();

  const data = getData();
  const cleanup: CleanupRecord = {
    ...record,
    id: randomUUID(),
  };

  data.cleanups.unshift(cleanup);
  await saveDatabase();

  return cleanup;
}

export async function getCleanupHistory(
  limit?: number,
  offset?: number,
): Promise<{ cleanups: CleanupRecord[]; total: number }> {
  await loadDatabase();

  const data = getData();
  const allCleanups = data.cleanups;
  const total = allCleanups.length;

  let cleanups = allCleanups;
  if (offset !== undefined) {
    cleanups = cleanups.slice(offset);
  }
  if (limit !== undefined) {
    cleanups = cleanups.slice(0, limit);
  }

  return { cleanups, total };
}

export async function getLatestCleanup(): Promise<CleanupRecord | null> {
  await loadDatabase();

  const data = getData();
  return data.cleanups[0] ?? null;
}

export async function getTotalSpaceRecovered(): Promise<number> {
  await loadDatabase();

  const data = getData();
  return data.cleanups.reduce((sum, c) => sum + c.spaceRecovered, 0);
}
