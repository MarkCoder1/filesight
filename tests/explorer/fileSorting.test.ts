import { describe, expect, it } from 'vitest';

import { sortFiles } from '../../src/lib/fileSorting';
import type { FileEntry } from '../../src/types';

function makeFile(
  name: string,
  size: number,
  category: FileEntry['category'],
  daysAgo: number,
): FileEntry {
  const now = Date.now();
  return {
    id: name,
    name,
    path: `/test/${name}`,
    extension: 'ext',
    size,
    createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
    modifiedAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
    isDirectory: false,
    category,
  };
}

const FIXTURES: FileEntry[] = [
  makeFile('alpha', 100, 'documents', 10),
  makeFile('beta', 50, 'images', 5),
  makeFile('gamma', 200, 'videos', 1),
];

describe('sortFiles', () => {
  it('sorts name A–Z', () => {
    const result = sortFiles(FIXTURES, 'name-asc');
    expect(result.map((f) => f.name)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts name Z–A', () => {
    const result = sortFiles(FIXTURES, 'name-desc');
    expect(result.map((f) => f.name)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('sorts largest first', () => {
    const result = sortFiles(FIXTURES, 'size-desc');
    expect(result.map((f) => f.name)).toEqual(['gamma', 'alpha', 'beta']);
  });

  it('sorts smallest first', () => {
    const result = sortFiles(FIXTURES, 'size-asc');
    expect(result.map((f) => f.name)).toEqual(['beta', 'alpha', 'gamma']);
  });

  it('sorts newest first', () => {
    const result = sortFiles(FIXTURES, 'date-desc');
    expect(result.map((f) => f.name)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('sorts oldest first', () => {
    const result = sortFiles(FIXTURES, 'date-asc');
    expect(result.map((f) => f.name)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('does not mutate the original array', () => {
    const copy = [...FIXTURES];
    sortFiles(FIXTURES, 'size-desc');
    expect(FIXTURES).toEqual(copy);
  });
});
