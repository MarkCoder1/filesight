import { randomUUID } from 'crypto';

import { getData, loadDatabase, saveDatabase } from './database';
import type { ScanRecord } from './types';

export async function saveScan(record: Omit<ScanRecord, 'id'>): Promise<ScanRecord> {
  await loadDatabase();

  const data = getData();
  const scan: ScanRecord = {
    ...record,
    id: randomUUID(),
  };

  data.scans.unshift(scan);
  await saveDatabase();

  return scan;
}

export async function getScanHistory(
  limit?: number,
  offset?: number,
): Promise<{ scans: ScanRecord[]; total: number }> {
  await loadDatabase();

  const data = getData();
  const allScans = data.scans;
  const total = allScans.length;

  let scans = allScans;
  if (offset !== undefined) {
    scans = scans.slice(offset);
  }
  if (limit !== undefined) {
    scans = scans.slice(0, limit);
  }

  return { scans, total };
}

export async function getScanById(id: string): Promise<ScanRecord | null> {
  await loadDatabase();

  const data = getData();
  return data.scans.find((s) => s.id === id) ?? null;
}

export async function getLatestScan(): Promise<ScanRecord | null> {
  await loadDatabase();

  const data = getData();
  return data.scans[0] ?? null;
}

export async function compareScans(
  scanId1: string,
  scanId2: string,
): Promise<{
  scan1: ScanRecord;
  scan2: ScanRecord;
  storageDifference: number;
  fileDifference: number;
  categoryChanges: { category: string; countDiff: number; sizeDiff: number }[];
} | null> {
  await loadDatabase();

  const scan1 = await getScanById(scanId1);
  const scan2 = await getScanById(scanId2);

  if (!scan1 || !scan2) return null;

  const storageDifference = scan2.totalSize - scan1.totalSize;
  const fileDifference = scan2.totalFiles - scan1.totalFiles;

  const categoryChanges = scan1.categories.map((c1) => {
    const c2 = scan2.categories.find((c) => c.category === c1.category);
    return {
      category: c1.category,
      countDiff: (c2?.count ?? 0) - c1.count,
      sizeDiff: (c2?.totalSize ?? 0) - c1.totalSize,
    };
  });

  return {
    scan1,
    scan2,
    storageDifference,
    fileDifference,
    categoryChanges,
  };
}
