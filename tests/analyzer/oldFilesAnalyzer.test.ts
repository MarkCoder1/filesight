import { describe, expect, it } from 'vitest';

import { findOldFiles } from '../../electron/analyzer/oldFilesAnalyzer';
import type { FileEntry } from '../../src/types';

function makeFile(name: string, daysAgo: number): FileEntry {
  const now = Date.now();
  return {
    id: name,
    name,
    path: `/test/${name}`,
    extension: name.includes('.') ? name.split('.').pop()! : '',
    size: 1000,
    createdAt: new Date(now - daysAgo * 86400000),
    modifiedAt: new Date(now - daysAgo * 86400000),
    isDirectory: false,
    category: 'documents',
  };
}

describe('findOldFiles', () => {
  it('classifies files by age thresholds', () => {
    const files = [
      makeFile('recent.txt', 1),
      makeFile('old-6m.txt', 181),
      makeFile('old-1y.txt', 366),
      makeFile('old-2y.txt', 731),
    ];
    const result = findOldFiles(files);

    expect(result.olderThan6Months).toBe(3);
    expect(result.olderThan1Year).toBe(2);
    expect(result.olderThan2Years).toBe(1);

    const names = result.files.map((f) => f.name);
    expect(names).toContain('old-2y.txt');
    expect(names).toContain('old-1y.txt');
    expect(names).toContain('old-6m.txt');
    expect(names).not.toContain('recent.txt');
  });

  it('sorts old files by age descending', () => {
    const files = [
      makeFile('six-month', 181),
      makeFile('two-year', 731),
      makeFile('one-year', 366),
    ];
    const result = findOldFiles(files);
    expect(result.files[0].ageDays).toBe(731);
    expect(result.files[1].ageDays).toBe(366);
    expect(result.files[2].ageDays).toBe(181);
  });

  it('returns zeros for no old files', () => {
    const files = [makeFile('new.txt', 1)];
    const result = findOldFiles(files);
    expect(result.olderThan6Months).toBe(0);
    expect(result.olderThan1Year).toBe(0);
    expect(result.olderThan2Years).toBe(0);
    expect(result.files).toHaveLength(0);
  });
});
