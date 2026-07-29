import { describe, expect, it } from 'vitest';

import { analyzeStorage } from '../../electron/analyzer/storageAnalyzer';
import type { FileEntry } from '../../src/types';

function makeFile(name: string, size: number, daysAgo: number = 0): FileEntry {
  const now = Date.now();
  return {
    id: name,
    name,
    path: `/test/${name}`,
    extension: name.includes('.') ? name.split('.').pop()! : '',
    size,
    createdAt: new Date(now - daysAgo * 86400000),
    modifiedAt: new Date(now - daysAgo * 86400000),
    isDirectory: false,
    category: 'documents',
  };
}

describe('analyzeStorage', () => {
  it('returns zeros for an empty array', () => {
    const result = analyzeStorage([]);
    expect(result.totalFiles).toBe(0);
    expect(result.totalSize).toBe(0);
    expect(result.averageSize).toBe(0);
    expect(result.largestFile).toBeNull();
    expect(result.smallestFile).toBeNull();
  });

  it('calculates correct stats for a single file', () => {
    const result = analyzeStorage([makeFile('test.pdf', 1_000_000)]);
    expect(result.totalFiles).toBe(1);
    expect(result.totalSize).toBe(1_000_000);
    expect(result.averageSize).toBe(1_000_000);
    expect(result.largestFile?.name).toBe('test.pdf');
    expect(result.smallestFile?.name).toBe('test.pdf');
  });

  it('calculates correct sum: 100MB + 200MB = 300MB', () => {
    const files = [makeFile('a.zip', 100_000_000), makeFile('b.zip', 200_000_000)];
    const result = analyzeStorage(files);
    expect(result.totalSize).toBe(300_000_000);
    expect(result.totalFiles).toBe(2);
    expect(result.averageSize).toBe(150_000_000);
  });

  it('identifies largest and smallest files', () => {
    const files = [
      makeFile('small.txt', 500),
      makeFile('medium.txt', 50_000),
      makeFile('large.txt', 900_000),
    ];
    const result = analyzeStorage(files);
    expect(result.largestFile?.name).toBe('large.txt');
    expect(result.largestFile?.size).toBe(900_000);
    expect(result.smallestFile?.name).toBe('small.txt');
    expect(result.smallestFile?.size).toBe(500);
  });

  it('skips directories in calculations', () => {
    const dir: FileEntry = {
      id: 'folder',
      name: 'folder',
      path: '/test/folder',
      extension: '',
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDirectory: true,
      category: 'other',
    };
    const file = makeFile('actual.txt', 10_000);
    const result = analyzeStorage([dir, file]);
    expect(result.totalFiles).toBe(1);
    expect(result.totalSize).toBe(10_000);
  });

  it('handles many files quickly', () => {
    const files = Array.from({ length: 1000 }, (_, i) => makeFile(`file-${i}.txt`, i * 100));
    const result = analyzeStorage(files);
    expect(result.totalFiles).toBe(1000);
    expect(result.totalSize).toBe(499_500 * 100);
  });
});
