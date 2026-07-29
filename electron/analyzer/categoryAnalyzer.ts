import type { FileCategory, FileEntry } from '../../src/types';
import type { CategoryStats } from './types';

export function analyzeCategories(files: FileEntry[]): CategoryStats[] {
  const map = new Map<FileCategory, { count: number; totalSize: number; files: string[] }>();

  for (const file of files) {
    if (file.isDirectory) continue;

    const existing = map.get(file.category) ?? { count: 0, totalSize: 0, files: [] };
    existing.count++;
    existing.totalSize += file.size;
    existing.files.push(file.name);
    map.set(file.category, existing);
  }

  const totalSize = Array.from(map.values()).reduce((s, v) => s + v.totalSize, 0);

  return (Array.from(map.entries()) as [FileCategory, { count: number; totalSize: number; files: string[] }][])
    .map(([category, data]) => ({
      category,
      count: data.count,
      totalSize: data.totalSize,
      percentage: totalSize > 0 ? (data.totalSize / totalSize) * 100 : 0,
      files: data.files.slice(0, 5),
    }))
    .sort((a, b) => b.totalSize - a.totalSize);
}
