import type { FileCategory, FileEntry } from '../../src/types';

export interface LargeFileEntry {
  name: string;
  path: string;
  size: number;
  category: FileCategory;
}

export function findLargestFiles(files: FileEntry[], count: number = 10): LargeFileEntry[] {
  return files
    .filter((f) => !f.isDirectory)
    .sort((a, b) => b.size - a.size)
    .slice(0, count)
    .map((f) => ({ name: f.name, path: f.path, size: f.size, category: f.category }));
}
