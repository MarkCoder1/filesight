import { describe, expect, it } from 'vitest';

import { findLargestFiles } from '../../electron/analyzer/largeFilesAnalyzer';
import type { FileEntry } from '../../src/types';

function makeFile(name: string, size: number, category: FileEntry['category'] = 'documents'): FileEntry {
  return {
    id: name,
    name,
    path: `/test/${name}`,
    extension: name.includes('.') ? name.split('.').pop()! : '',
    size,
    createdAt: new Date(),
    modifiedAt: new Date(),
    isDirectory: false,
    category,
  };
}

describe('findLargestFiles', () => {
  it('returns top N files by size', () => {
    const files = [
      makeFile('small.txt', 100),
      makeFile('medium.txt', 500),
      makeFile('large.txt', 900),
      makeFile('big.txt', 700),
    ];
    const result = findLargestFiles(files, 2);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('large.txt');
    expect(result[1].name).toBe('big.txt');
  });

  it('returns fewer items when count exceeds array length', () => {
    const files = [makeFile('a.txt', 100)];
    const result = findLargestFiles(files, 10);
    expect(result).toHaveLength(1);
  });

  it('excludes directories', () => {
    const dir: FileEntry = {
      id: 'folder', name: 'folder', path: '/test/folder',
      extension: '', size: 999_999, createdAt: new Date(), modifiedAt: new Date(),
      isDirectory: true, category: 'other',
    };
    const file = makeFile('real.txt', 500);
    const result = findLargestFiles([dir, file]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('real.txt');
  });

  it('returns empty array for no files', () => {
    expect(findLargestFiles([])).toEqual([]);
  });
});
