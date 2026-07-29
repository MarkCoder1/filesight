import type { FileEntry } from '../../src/types';
import type { StorageStats } from './types';

export function analyzeStorage(files: FileEntry[]): StorageStats {
  if (files.length === 0) {
    return {
      totalFiles: 0,
      totalSize: 0,
      averageSize: 0,
      largestFile: null,
      smallestFile: null,
    };
  }

  let totalSize = 0;
  let largestFile: { name: string; size: number } | null = null;
  let smallestFile: { name: string; size: number } | null = null;

  for (const file of files) {
    if (file.isDirectory) continue;

    totalSize += file.size;

    if (!largestFile || file.size > largestFile.size) {
      largestFile = { name: file.name, size: file.size };
    }

    if (!smallestFile || file.size < smallestFile.size) {
      smallestFile = { name: file.name, size: file.size };
    }
  }

  return {
    totalFiles: files.filter((f) => !f.isDirectory).length,
    totalSize,
    averageSize: Math.round(totalSize / files.filter((f) => !f.isDirectory).length),
    largestFile,
    smallestFile,
  };
}
