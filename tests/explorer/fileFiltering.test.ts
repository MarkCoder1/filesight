import { describe, expect, it } from 'vitest';

import { filterFiles, type FileFilters } from '../../src/lib/fileFiltering';
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
  makeFile('tiny-image', 500_000, 'images', 0),
  makeFile('small-doc', 5_000_000, 'documents', 5),
  makeFile('medium-video', 100_000_000, 'videos', 15),
  makeFile('large-archive', 800_000_000, 'archives', 60),
  makeFile('huge-installer', 3_000_000_000, 'installers', 200),
  makeFile('old-code', 1_000, 'code', 400),
  makeFile('ancient-backup', 500, 'archives', 700),
];

describe('filterFiles', () => {
  it('returns all files when all filters are set to "all"', () => {
    const filters: FileFilters = { category: 'all', size: 'all', date: 'all' };
    const result = filterFiles(FIXTURES, filters);
    expect(result).toHaveLength(FIXTURES.length);
  });

  it('works with empty array', () => {
    const filters: FileFilters = { category: 'all', size: 'all', date: 'all' };
    const result = filterFiles([], filters);
    expect(result).toHaveLength(0);
  });

  describe('category filter', () => {
    it('filters by a single category', () => {
      const filters: FileFilters = { category: 'images', size: 'all', date: 'all' };
      const result = filterFiles(FIXTURES, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('tiny-image');
    });

    it('returns empty when category has no matches', () => {
      const filters: FileFilters = { category: 'audio', size: 'all', date: 'all' };
      const result = filterFiles(FIXTURES, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe('size filter', () => {
    it('filters small files (< 10MB)', () => {
      const filters: FileFilters = { category: 'all', size: 'small', date: 'all' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual([
        'tiny-image',
        'small-doc',
        'old-code',
        'ancient-backup',
      ]);
    });

    it('filters medium files (10MB–500MB)', () => {
      const filters: FileFilters = { category: 'all', size: 'medium', date: 'all' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual(['medium-video']);
    });

    it('filters large files (500MB–2GB)', () => {
      const filters: FileFilters = { category: 'all', size: 'large', date: 'all' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual(['large-archive']);
    });

    it('filters huge files (> 2GB)', () => {
      const filters: FileFilters = { category: 'all', size: 'huge', date: 'all' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual(['huge-installer']);
    });
  });

  describe('date filter', () => {
    it('filters files modified today', () => {
      const filters: FileFilters = { category: 'all', size: 'all', date: 'today' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual(['tiny-image']);
    });

    it('filters files from the last week', () => {
      const filters: FileFilters = { category: 'all', size: 'all', date: 'week' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual(['tiny-image', 'small-doc']);
    });

    it('filters files from the last month', () => {
      const filters: FileFilters = { category: 'all', size: 'all', date: 'month' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual(['tiny-image', 'small-doc', 'medium-video']);
    });

    it('filters files older than 6 months', () => {
      const filters: FileFilters = { category: 'all', size: 'all', date: 'old-6m' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual(['huge-installer', 'old-code', 'ancient-backup']);
    });

    it('filters files older than 1 year', () => {
      const filters: FileFilters = { category: 'all', size: 'all', date: 'old-1y' };
      const result = filterFiles(FIXTURES, filters);
      expect(result.map((f) => f.name)).toEqual(['old-code', 'ancient-backup']);
    });
  });
});
