import { describe, expect, it } from 'vitest';

import { analyzeCategories } from '../../electron/analyzer/categoryAnalyzer';
import type { FileEntry } from '../../src/types';

function makeFile(name: string, category: FileEntry['category'], size: number): FileEntry {
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

describe('analyzeCategories', () => {
  it('returns empty array for no files', () => {
    expect(analyzeCategories([])).toEqual([]);
  });

  it('groups files by category', () => {
    const files = [
      makeFile('photo.jpg', 'images', 1_000_000),
      makeFile('doc.pdf', 'documents', 500_000),
      makeFile('photo2.png', 'images', 2_000_000),
    ];
    const result = analyzeCategories(files);
    expect(result).toHaveLength(2);

    const images = result.find((c) => c.category === 'images');
    expect(images?.count).toBe(2);
    expect(images?.totalSize).toBe(3_000_000);

    const docs = result.find((c) => c.category === 'documents');
    expect(docs?.count).toBe(1);
    expect(docs?.totalSize).toBe(500_000);
  });

  it('calculates percentages correctly', () => {
    const files = [makeFile('a.jpg', 'images', 1_000), makeFile('b.mp4', 'videos', 3_000)];
    const result = analyzeCategories(files);
    const images = result.find((c) => c.category === 'images')!;
    const videos = result.find((c) => c.category === 'videos')!;
    expect(images.percentage).toBe(25);
    expect(videos.percentage).toBe(75);
  });

  it('sorts by totalSize descending', () => {
    const files = [
      makeFile('small.jpg', 'images', 1_000),
      makeFile('big.mp4', 'videos', 100_000),
      makeFile('medium.pdf', 'documents', 10_000),
    ];
    const result = analyzeCategories(files);
    expect(result[0].category).toBe('videos');
    expect(result[1].category).toBe('documents');
    expect(result[2].category).toBe('images');
  });
});
