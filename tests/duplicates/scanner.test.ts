import path from 'path';
import fs from 'fs/promises';
import os from 'os';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildScanResult, scanDuplicates } from '../../electron/duplicate-engine';
import {
  areFilenamesSimilar,
  normalizeFileName,
} from '../../electron/duplicate-engine/filenameMatcher';
import { calculateChunkHash, calculateFileHash } from '../../electron/duplicate-engine/hasher';
import {
  areImagesSimilar,
  computeDHash,
  hammingDistance,
  isImageFile,
} from '../../electron/duplicate-engine/imageHash';
import type { DuplicateGroup } from '../../electron/duplicate-engine/types';

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

describe('calculateChunkHash', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'chunk-hash-'));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('returns a hash for a large file', async () => {
    const filePath = path.join(testDir, 'large.bin');
    const buffer = Buffer.alloc(60 * 1024 * 1024, 'A');
    await fs.writeFile(filePath, buffer);

    const result = await calculateChunkHash(filePath);

    expect(result.hash).toBeTruthy();
    expect(result.hash.length).toBe(64);
    expect(result.size).toBe(60 * 1024 * 1024);
  });

  it('falls back to full hash for small files', async () => {
    const filePath = path.join(testDir, 'small.txt');
    await fs.writeFile(filePath, 'hello world');

    const chunkResult = await calculateChunkHash(filePath);
    const fullResult = await calculateFileHash(filePath);

    expect(chunkResult.hash).toBe(fullResult.hash);
  });

  it('generates same chunk hash for identical large files', async () => {
    const f1 = path.join(testDir, 'copy1.bin');
    const f2 = path.join(testDir, 'copy2.bin');
    const buffer = Buffer.alloc(60 * 1024 * 1024, 'B');
    await fs.writeFile(f1, buffer);
    await fs.writeFile(f2, buffer);

    const [r1, r2] = await Promise.all([calculateChunkHash(f1), calculateChunkHash(f2)]);

    expect(r1.hash).toBe(r2.hash);
  });

  it('supports abort signal', async () => {
    const filePath = path.join(testDir, 'abort.bin');
    const buffer = Buffer.alloc(60 * 1024 * 1024, 'C');
    await fs.writeFile(filePath, buffer);

    const controller = new AbortController();
    controller.abort();

    await expect(calculateChunkHash(filePath, controller.signal)).rejects.toThrow('Aborted');
  });
});

describe('normalizeFileName', () => {
  it('removes "copy" suffix', () => {
    expect(normalizeFileName('file copy.txt').stem).toBe('file');
  });

  it('removes "(1)" numbering', () => {
    expect(normalizeFileName('file (1).txt').stem).toBe('file');
  });

  it('removes trailing numbers', () => {
    expect(normalizeFileName('file-2.txt').stem).toBe('file');
  });

  it('preserves original for clean names', () => {
    expect(normalizeFileName('document.pdf').stem).toBe('document');
  });

  it('extracts extension', () => {
    expect(normalizeFileName('photo.png').extension).toBe('.png');
  });

  it('handles conflicted copy patterns', () => {
    expect(normalizeFileName('file (conflicted copy 2024-01-01).txt').stem).toBe('file');
  });
});

describe('areFilenamesSimilar', () => {
  it('detects copy pattern: file.png vs file copy.png', () => {
    expect(areFilenamesSimilar('file.png', 'file copy.png')).toBe(true);
  });

  it('detects numbering pattern: document.pdf vs document (1).pdf', () => {
    expect(areFilenamesSimilar('document.pdf', 'document (1).pdf')).toBe(true);
  });

  it('detects dash-number pattern: photo.jpg vs photo-2.jpg', () => {
    expect(areFilenamesSimilar('photo.jpg', 'photo-2.jpg')).toBe(true);
  });

  it('detects final-copy pattern: report-final.docx vs report-final-copy.docx', () => {
    expect(areFilenamesSimilar('report-final.docx', 'report-final-copy.docx')).toBe(true);
  });

  it('returns false for different extensions', () => {
    expect(areFilenamesSimilar('file.png', 'file.jpg')).toBe(false);
  });

  it('returns false for completely different names', () => {
    expect(areFilenamesSimilar('cat.png', 'dog.png')).toBe(false);
  });

  it('handles exact same names', () => {
    expect(areFilenamesSimilar('same.txt', 'same.txt')).toBe(true);
  });
});

describe('isImageFile', () => {
  it('recognizes common image extensions', () => {
    expect(isImageFile('photo.jpg')).toBe(true);
    expect(isImageFile('photo.jpeg')).toBe(true);
    expect(isImageFile('photo.png')).toBe(true);
    expect(isImageFile('photo.gif')).toBe(true);
    expect(isImageFile('photo.webp')).toBe(true);
  });

  it('returns false for non-images', () => {
    expect(isImageFile('document.pdf')).toBe(false);
    expect(isImageFile('archive.zip')).toBe(false);
  });
});

describe('hammingDistance', () => {
  it('returns 0 for identical hashes', () => {
    expect(hammingDistance('abc', 'abc')).toBe(0);
  });

  it('returns correct distance for different hashes', () => {
    const hash1 = '0000000000000000';
    const hash2 = 'ffffffffffffffff';
    expect(hammingDistance(hash1, hash2)).toBe(64);
  });
});

describe('areImagesSimilar', () => {
  it('considers identical hashes similar', () => {
    expect(areImagesSimilar('abc123', 'abc123')).toBe(true);
  });

  it('respects custom threshold', () => {
    expect(areImagesSimilar('0000000000000000', '0000000000000001', 0)).toBe(false);
    expect(areImagesSimilar('0000000000000000', '0000000000000001', 1)).toBe(true);
  });
});

describe('scanDuplicates', () => {
  let testDir: string;

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
    expect(result[0].confidence).toBe('exact');
    expect(result[0].matchType).toBe('hash-exact');
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
    const f2 = {
      path: '/does/not/exist.txt',
      name: 'missing.txt',
      size: 100,
      modifiedAt: new Date(),
    };

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

  it('detects filename-based duplicates: file.png vs file copy.png', async () => {
    const content = 'A'.repeat(1000);
    const f1 = await makeFile('logo.png', content);
    const f2 = await makeFile('logo copy.png', content);

    const result = await scanDuplicates([f1, f2]);

    expect(result.length).toBeGreaterThanOrEqual(1);
    if (result.length > 0) {
      expect(result[0].files.length).toBe(2);
    }
  });

  it('detects filename-based duplicates: document.pdf vs document (1).pdf', async () => {
    const content = 'B'.repeat(1000);
    const f1 = await makeFile('document.pdf', content);
    const f2 = await makeFile('document (1).pdf', content);

    const result = await scanDuplicates([f1, f2]);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('does NOT flag same-name different-content as duplicate', async () => {
    const f1 = await makeFile('same.txt', 'content A');
    const f2 = await makeFile('same copy.txt', 'different content');

    const result = await scanDuplicates([f1, f2]);

    expect(result).toEqual([]);
  });

  it('reports stage in progress', async () => {
    const f1 = await makeFile('a.txt', 'content');
    const f2 = await makeFile('b.txt', 'content');
    const onProgress = vi.fn();

    await scanDuplicates([f1, f2], onProgress);

    const stages = onProgress.mock.calls.map((c: unknown[]) => (c[0] as { stage: string }).stage);
    expect(stages).toContain('metadata');
    expect(stages).toContain('filename');
    expect(stages).toContain('hashing');
  });
});

describe('buildScanResult', () => {
  it('aggregates duplicate groups correctly', () => {
    const groups: DuplicateGroup[] = [
      {
        id: 'dup-0',
        hash: 'abc',
        files: [
          {
            path: '/a.txt',
            name: 'a.txt',
            size: 100,
            modifiedAt: new Date(),
            hash: 'abc',
            confidence: 'exact',
            matchType: 'hash-exact',
          },
          {
            path: '/b.txt',
            name: 'b.txt',
            size: 100,
            modifiedAt: new Date(),
            hash: 'abc',
            confidence: 'exact',
            matchType: 'hash-exact',
          },
        ],
        totalSize: 200,
        wastedSpace: 100,
        confidence: 'exact',
        matchType: 'hash-exact',
      },
      {
        id: 'dup-1',
        hash: 'def',
        files: [
          {
            path: '/c.txt',
            name: 'c.txt',
            size: 50,
            modifiedAt: new Date(),
            hash: 'def',
            confidence: 'exact',
            matchType: 'hash-exact',
          },
          {
            path: '/d.txt',
            name: 'd.txt',
            size: 50,
            modifiedAt: new Date(),
            hash: 'def',
            confidence: 'exact',
            matchType: 'hash-exact',
          },
          {
            path: '/e.txt',
            name: 'e.txt',
            size: 50,
            modifiedAt: new Date(),
            hash: 'def',
            confidence: 'exact',
            matchType: 'hash-exact',
          },
        ],
        totalSize: 150,
        wastedSpace: 100,
        confidence: 'exact',
        matchType: 'hash-exact',
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
