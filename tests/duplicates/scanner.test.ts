import path from 'path';
import fs from 'fs/promises';
import os from 'os';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildScanResult } from '../../electron/duplicates/duplicateAnalyzer';
import { scanDuplicates } from '../../electron/duplicates/duplicateScanner';
import { calculateFileHash } from '../../electron/duplicates/hashCalculator';
import type { DuplicateGroup } from '../../electron/duplicates/types';

describe('calculateFileHash', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hash-test-'));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('returns hash and size for a file', async () => {
    const filePath = path.join(testDir, 'test.txt');
    await fs.writeFile(filePath, 'hello world');

    const result = await calculateFileHash(filePath);

    expect(result.hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    expect(result.size).toBe(11);
  });

  it('uses streaming to handle large files', async () => {
    const filePath = path.join(testDir, 'large.bin');
    const buffer = Buffer.alloc(1024 * 1024, 'A');
    await fs.writeFile(filePath, buffer);

    const result = await calculateFileHash(filePath);

    expect(result.hash).toBeTruthy();
    expect(result.size).toBe(1024 * 1024);
  });

  it('rejects for non-existent files', async () => {
    await expect(calculateFileHash('/nonexistent/path')).rejects.toThrow();
  });

  it('generates consistent hashes for same content', async () => {
    const file1 = path.join(testDir, 'a.txt');
    const file2 = path.join(testDir, 'b.txt');
    await fs.writeFile(file1, 'same content');
    await fs.writeFile(file2, 'same content');

    const [r1, r2] = await Promise.all([calculateFileHash(file1), calculateFileHash(file2)]);

    expect(r1.hash).toBe(r2.hash);
    expect(r1.size).toBe(r2.size);
  });

  it('generates different hashes for different content', async () => {
    const file1 = path.join(testDir, 'a.txt');
    const file2 = path.join(testDir, 'b.txt');
    await fs.writeFile(file1, 'content A');
    await fs.writeFile(file2, 'content B');

    const [r1, r2] = await Promise.all([calculateFileHash(file1), calculateFileHash(file2)]);

    expect(r1.hash).not.toBe(r2.hash);
  });

  it('supports abort signal', async () => {
    const filePath = path.join(testDir, 'file.bin');
    const buffer = Buffer.alloc(10 * 1024 * 1024, 'B');
    await fs.writeFile(filePath, buffer);

    const controller = new AbortController();

    controller.abort();

    await expect(calculateFileHash(filePath, controller.signal)).rejects.toThrow('Aborted');
  });
});

describe('scanDuplicates', () => {
  let testDir: string;
  const baseFiles: { path: string; name: string; size: number; modifiedAt: Date }[] = [];

  async function makeFile(name: string, content: string) {
    const filePath = path.join(testDir, name);
    await fs.writeFile(filePath, content);
    const stat = await fs.stat(filePath);
    return {
      path: filePath,
      name,
      size: stat.size,
      modifiedAt: stat.mtime,
    };
  }

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dup-test-'));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('finds duplicate files with same content', async () => {
    const f1 = await makeFile('photo.png', 'image content');
    const f2 = await makeFile('photo-copy.png', 'image content');
    const f3 = await makeFile('different.png', 'different content');

    const result = await scanDuplicates([f1, f2, f3]);

    expect(result).toHaveLength(1);
    expect(result[0].files).toHaveLength(2);
    expect(result[0].wastedSpace).toBe(f1.size);
  });

  it('returns empty array when no duplicates exist', async () => {
    const f1 = await makeFile('a.txt', 'content A');
    const f2 = await makeFile('b.txt', 'content B');

    const result = await scanDuplicates([f1, f2]);

    expect(result).toEqual([]);
  });

  it('groups files with different sizes separately', async () => {
    const f1 = await makeFile('small.txt', 'small');
    const f2 = await makeFile('large.txt', 'x'.repeat(1000));

    const result = await scanDuplicates([f1, f2]);

    expect(result).toEqual([]);
  });

  it('handles three identical files', async () => {
    const f1 = await makeFile('a.txt', 'same');
    const f2 = await makeFile('b.txt', 'same');
    const f3 = await makeFile('c.txt', 'same');

    const result = await scanDuplicates([f1, f2, f3]);

    expect(result).toHaveLength(1);
    expect(result[0].files).toHaveLength(3);
    expect(result[0].wastedSpace).toBe(f1.size * 2);
  });

  it('detects two separate duplicate groups', async () => {
    const f1 = await makeFile('a.txt', 'group one');
    const f2 = await makeFile('a-copy.txt', 'group one');
    const f3 = await makeFile('b.txt', 'group two');
    const f4 = await makeFile('b-copy.txt', 'group two');

    const result = await scanDuplicates([f1, f2, f3, f4]);

    expect(result).toHaveLength(2);
  });

  it('calls onProgress callback', async () => {
    const f1 = await makeFile('a.txt', 'content');
    const f2 = await makeFile('b.txt', 'content');
    const onProgress = vi.fn();

    await scanDuplicates([f1, f2], onProgress);

    expect(onProgress).toHaveBeenCalled();
    expect(onProgress.mock.calls[0][0]).toHaveProperty('processedFiles');
    expect(onProgress.mock.calls[0][0]).toHaveProperty('totalFiles');
    expect(onProgress.mock.calls[0][0]).toHaveProperty('percentage');
  });

  it('skips files that cause errors', async () => {
    const f1 = await makeFile('exist.txt', 'hello');
    const f2 = { path: '/does/not/exist.txt', name: 'missing.txt', size: 100, modifiedAt: new Date() };

    const result = await scanDuplicates([f1, f2]);

    expect(result).toEqual([]);
  });

  it('supports cancellation via AbortSignal', async () => {
    const f1 = await makeFile('a.txt', 'hello');
    const f2 = await makeFile('b.txt', 'hello');
    const controller = new AbortController();
    controller.abort();

    const result = await scanDuplicates([f1, f2], undefined, controller.signal);

    expect(result).toEqual([]);
  });

  it('sorts groups by wasted space descending', async () => {
    const s1 = await makeFile('small.txt', 'x');
    const s2 = await makeFile('small-copy.txt', 'x');
    const big1 = await makeFile('big.txt', 'x'.repeat(100));
    const big2 = await makeFile('big-copy.txt', 'x'.repeat(100));
    const big3 = await makeFile('big-third.txt', 'x'.repeat(100));

    const result = await scanDuplicates([s1, s2, big1, big2, big3]);

    expect(result[0].wastedSpace).toBeGreaterThanOrEqual(result[1]?.wastedSpace ?? 0);
  });
});

describe('buildScanResult', () => {
  it('aggregates duplicate groups correctly', () => {
    const groups: DuplicateGroup[] = [
      {
        id: 'dup-0',
        hash: 'abc',
        files: [
          { path: '/a.txt', name: 'a.txt', size: 100, modifiedAt: new Date(), hash: 'abc' },
          { path: '/b.txt', name: 'b.txt', size: 100, modifiedAt: new Date(), hash: 'abc' },
        ],
        totalSize: 200,
        wastedSpace: 100,
      },
      {
        id: 'dup-1',
        hash: 'def',
        files: [
          { path: '/c.txt', name: 'c.txt', size: 50, modifiedAt: new Date(), hash: 'def' },
          { path: '/d.txt', name: 'd.txt', size: 50, modifiedAt: new Date(), hash: 'def' },
          { path: '/e.txt', name: 'e.txt', size: 50, modifiedAt: new Date(), hash: 'def' },
        ],
        totalSize: 150,
        wastedSpace: 100,
      },
    ];

    const result = buildScanResult(groups);

    expect(result.totalDuplicates).toBe(5);
    expect(result.wastedSpace).toBe(200);
    expect(result.duplicateGroups).toHaveLength(2);
  });

  it('returns zeros for empty groups', () => {
    const result = buildScanResult([]);
    expect(result.totalDuplicates).toBe(0);
    expect(result.wastedSpace).toBe(0);
    expect(result.duplicateGroups).toEqual([]);
  });
});
