import { describe, expect, it } from 'vitest';

import { analyzeFiles } from '../../electron/analyzer/index';
import type { FileEntry } from '../../src/types';

function makeFile(
  name: string,
  extension: string,
  size: number,
  daysAgo: number,
  category: FileEntry['category'],
): FileEntry {
  const now = Date.now();
  return {
    id: name,
    name,
    path: `/test/${name}`,
    extension,
    size,
    createdAt: new Date(now - daysAgo * 86400000),
    modifiedAt: new Date(now - daysAgo * 86400000),
    isDirectory: false,
    category,
  };
}

describe('analyzeFiles (integration)', () => {
  it('produces a complete AnalysisResult', () => {
    const files: FileEntry[] = [
      makeFile('photo.jpg', '.jpg', 2_000_000, 1, 'images'),
      makeFile('doc.pdf', '.pdf', 500_000, 1, 'documents'),
      makeFile('old-installer.dmg', '.dmg', 300_000_000, 270, 'installers'),
      makeFile('big-video.mp4', '.mp4', 4_000_000_000, 5, 'videos'),
      makeFile('tiny.txt', '.txt', 100, 1, 'documents'),
    ];

    const result = analyzeFiles(files);

    expect(result.storageStats.totalFiles).toBe(5);
    expect(result.storageStats.totalSize).toBe(4_302_500_100);
    expect(result.storageStats.largestFile?.name).toBe('big-video.mp4');
    expect(result.storageStats.smallestFile?.name).toBe('tiny.txt');

    expect(result.categories).toHaveLength(4);
    const images = result.categories.find((c) => c.category === 'images');
    expect(images?.count).toBe(1);
    expect(images?.totalSize).toBe(2_000_000);
    const docs = result.categories.find((c) => c.category === 'documents');
    expect(docs?.count).toBe(2);

    expect(result.largestFiles).toHaveLength(5);
    expect(result.largestFiles[0].name).toBe('big-video.mp4');

    expect(result.oldFiles.olderThan6Months).toBe(1);
    expect(result.oldFiles.olderThan1Year).toBe(0);

    expect(result.suggestions.length).toBeGreaterThanOrEqual(2);
    expect(result.suggestions.find((s) => s.type === 'old-installers')).toBeDefined();
    expect(result.suggestions.find((s) => s.type === 'large-files')).toBeDefined();
  });
});
