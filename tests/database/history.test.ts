/// <reference types="vitest" />
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setDbPath, loadDatabase, saveDatabase, getData, resetDatabase } from '../../electron/database/database';
import { saveScan, getScanHistory, getScanById, getLatestScan, compareScans } from '../../electron/database/scanRepository';
import { saveCleanup, getCleanupHistory, getLatestCleanup, getTotalSpaceRecovered } from '../../electron/database/cleanupRepository';
import type { StoredData } from '../../electron/database/types';

describe('Database', () => {
  let testDbPath: string;

  beforeEach(async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'db-test-'));
    testDbPath = path.join(dir, 'test-db.json');
    setDbPath(testDbPath);
  });

  afterEach(async () => {
    try {
      await fs.rm(path.dirname(testDbPath), { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe('loadDatabase / saveDatabase', () => {
    it('creates default data when file does not exist', async () => {
      const data = await loadDatabase();
      expect(data.scans).toEqual([]);
      expect(data.cleanups).toEqual([]);
    });

    it('persists and reloads data', async () => {
      const data = getData();
      data.scans.push({
        id: 'test-1',
        date: new Date().toISOString(),
        folderPath: '/test',
        totalFiles: 10,
        totalSize: 1000,
        categories: [],
        largestFiles: [],
        duplicateSize: 0,
        suggestionCount: 0,
      });
      await saveDatabase();

      setDbPath(testDbPath + '?fresh=true'); // force re-load
      setDbPath(testDbPath);

      const reloaded = await loadDatabase();
      expect(reloaded.scans).toHaveLength(1);
      expect(reloaded.scans[0].totalFiles).toBe(10);
    });
  });

  describe('resetDatabase', () => {
    it('clears all data', async () => {
      getData().scans.push({
        id: 'x',
        date: '',
        folderPath: '/x',
        totalFiles: 0,
        totalSize: 0,
        categories: [],
        largestFiles: [],
        duplicateSize: 0,
        suggestionCount: 0,
      });
      await saveDatabase();

      await resetDatabase();

      const data = await loadDatabase();
      expect(data.scans).toEqual([]);
      expect(data.cleanups).toEqual([]);
    });
  });
});

describe('ScanRepository', () => {
  let testDbPath: string;

  beforeEach(async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'scan-repo-'));
    testDbPath = path.join(dir, 'scans.json');
    setDbPath(testDbPath);
  });

  afterEach(async () => {
    try {
      await fs.rm(path.dirname(testDbPath), { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('saves and retrieves a scan', async () => {
    const saved = await saveScan({
      date: new Date('2026-07-29').toISOString(),
      folderPath: '/Downloads',
      totalFiles: 100,
      totalSize: 5000000,
      categories: [{ category: 'documents', count: 50, totalSize: 2000000, percentage: 40 }],
      largestFiles: [{ name: 'big.pdf', path: '/Downloads/big.pdf', size: 1000000, category: 'documents' }],
      duplicateSize: 0,
      suggestionCount: 2,
    });

    expect(saved.id).toBeTruthy();
    expect(saved.totalFiles).toBe(100);

    const found = await getScanById(saved.id);
    expect(found).not.toBeNull();
    expect(found!.totalFiles).toBe(100);
  });

  it('returns null for unknown scan id', async () => {
    const result = await getScanById('nonexistent');
    expect(result).toBeNull();
  });

  it('returns scans in reverse chronological order', async () => {
    await saveScan({
      date: new Date('2026-07-01').toISOString(),
      folderPath: '/Downloads',
      totalFiles: 50,
      totalSize: 1000,
      categories: [],
      largestFiles: [],
      duplicateSize: 0,
      suggestionCount: 0,
    });
    await saveScan({
      date: new Date('2026-07-29').toISOString(),
      folderPath: '/Downloads',
      totalFiles: 100,
      totalSize: 2000,
      categories: [],
      largestFiles: [],
      duplicateSize: 0,
      suggestionCount: 0,
    });

    const { scans } = await getScanHistory();
    expect(scans).toHaveLength(2);
    expect(scans[0].totalFiles).toBe(100); // most recent first
    expect(scans[1].totalFiles).toBe(50);
  });

  it('supports pagination with limit and offset', async () => {
    for (let i = 0; i < 5; i++) {
      await saveScan({
        date: new Date(2026, 6, i + 1).toISOString(),
        folderPath: '/Downloads',
        totalFiles: i,
        totalSize: i * 100,
        categories: [],
        largestFiles: [],
        duplicateSize: 0,
        suggestionCount: 0,
      });
    }

    const { scans, total } = await getScanHistory(2, 1);
    expect(total).toBe(5);
    expect(scans).toHaveLength(2);
  });

  it('gets the latest scan', async () => {
    await saveScan({
      date: new Date('2026-07-01').toISOString(),
      folderPath: '/Downloads',
      totalFiles: 10,
      totalSize: 100,
      categories: [],
      largestFiles: [],
      duplicateSize: 0,
      suggestionCount: 0,
    });
    const second = await saveScan({
      date: new Date('2026-07-29').toISOString(),
      folderPath: '/Downloads',
      totalFiles: 20,
      totalSize: 200,
      categories: [],
      largestFiles: [],
      duplicateSize: 0,
      suggestionCount: 0,
    });

    const latest = await getLatestScan();
    expect(latest?.id).toBe(second.id);
  });

  it('compares two scans', async () => {
    const s1 = await saveScan({
      date: new Date('2026-07-01').toISOString(),
      folderPath: '/Downloads',
      totalFiles: 100,
      totalSize: 5000,
      categories: [{ category: 'documents', count: 30, totalSize: 2000, percentage: 40 }],
      largestFiles: [],
      duplicateSize: 0,
      suggestionCount: 0,
    });
    const s2 = await saveScan({
      date: new Date('2026-07-29').toISOString(),
      folderPath: '/Downloads',
      totalFiles: 80,
      totalSize: 4000,
      categories: [{ category: 'documents', count: 25, totalSize: 1500, percentage: 37.5 }],
      largestFiles: [],
      duplicateSize: 0,
      suggestionCount: 0,
    });

    const result = await compareScans(s1.id, s2.id);
    expect(result).not.toBeNull();
    expect(result!.storageDifference).toBe(-1000);
    expect(result!.fileDifference).toBe(-20);
    expect(result!.categoryChanges).toHaveLength(1);
    expect(result!.categoryChanges[0].countDiff).toBe(-5);
  });

  it('returns null when comparing with nonexistent scan', async () => {
    const result = await compareScans('real-id', 'fake-id');
    expect(result).toBeNull();
  });
});

describe('CleanupRepository', () => {
  let testDbPath: string;

  beforeEach(async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cleanup-repo-'));
    testDbPath = path.join(dir, 'cleanups.json');
    setDbPath(testDbPath);
  });

  afterEach(async () => {
    try {
      await fs.rm(path.dirname(testDbPath), { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('saves and retrieves cleanup records', async () => {
    const saved = await saveCleanup({
      date: new Date().toISOString(),
      filesMoved: 5,
      totalFiles: 5,
      spaceRecovered: 1000000,
      files: ['/path/file1.txt', '/path/file2.txt'],
    });

    expect(saved.id).toBeTruthy();
    expect(saved.filesMoved).toBe(5);

    const { cleanups, total } = await getCleanupHistory();
    expect(total).toBe(1);
    expect(cleanups[0].spaceRecovered).toBe(1000000);
  });

  it('calculates total space recovered', async () => {
    await saveCleanup({
      date: new Date().toISOString(),
      filesMoved: 3,
      totalFiles: 3,
      spaceRecovered: 500000,
      files: [],
    });
    await saveCleanup({
      date: new Date().toISOString(),
      filesMoved: 2,
      totalFiles: 2,
      spaceRecovered: 300000,
      files: [],
    });

    const total = await getTotalSpaceRecovered();
    expect(total).toBe(800000);
  });

  it('gets the latest cleanup', async () => {
    const saved = await saveCleanup({
      date: new Date('2026-07-29').toISOString(),
      filesMoved: 10,
      totalFiles: 10,
      spaceRecovered: 2000000,
      files: [],
    });

    const latest = await getLatestCleanup();
    expect(latest?.id).toBe(saved.id);
  });

  it('returns null when no cleanups exist', async () => {
    const latest = await getLatestCleanup();
    expect(latest).toBeNull();
  });
});

describe('StoredData structure', () => {
  it('matches the expected schema', () => {
    const data: StoredData = {
      scans: [
        {
          id: 'scan-1',
          date: '2026-07-29T00:00:00.000Z',
          folderPath: '/Downloads',
          totalFiles: 100,
          totalSize: 5000000,
          categories: [
            { category: 'images', count: 30, totalSize: 2000000, percentage: 40 },
          ],
          largestFiles: [
            { name: 'photo.png', path: '/Downloads/photo.png', size: 1000000, category: 'images' },
          ],
          duplicateSize: 0,
          suggestionCount: 0,
        },
      ],
      cleanups: [
        {
          id: 'cleanup-1',
          date: '2026-07-29T00:00:00.000Z',
          filesMoved: 5,
          totalFiles: 5,
          spaceRecovered: 1000000,
          files: ['/Downloads/file1.txt'],
        },
      ],
    };

    expect(data.scans[0].totalFiles).toBe(100);
    expect(data.cleanups[0].spaceRecovered).toBe(1000000);
  });
});
