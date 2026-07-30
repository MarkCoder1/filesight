import { shell } from 'electron';

import { getData, loadDatabase, saveDatabase } from '../../database/database';

export interface RecommendedFile {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  resolution?: { width: number; height: number };
  matchType?: string;
}

export function recommendBestFile(files: RecommendedFile[]): RecommendedFile | null {
  if (files.length === 0) return null;

  const scored = files.map((f) => {
    let score = 0;

    // Higher resolution is better (for images/videos)
    if (f.resolution) {
      score += f.resolution.width * f.resolution.height;
    }

    // Larger useful size is better (more likely to be original)
    if (f.matchType !== 'filename-similar') {
      score += f.size / 1024;
    }

    // Newer modified date is better
    score += f.modifiedAt.getTime() / 100000000;

    return { file: f, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].file;
}

export async function trashDuplicateFiles(
  paths: { path: string; name: string }[],
  onProgress?: (current: number, total: number, currentFile: string) => void,
): Promise<{ successCount: number; failureCount: number; results: Array<{ path: string; name: string; success: boolean; error?: string }> }> {
  const results: Array<{ path: string; name: string; success: boolean; error?: string }> = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < paths.length; i++) {
    const { path, name } = paths[i];
    onProgress?.(i + 1, paths.length, name);

    try {
      await shell.trashItem(path);
      results.push({ path, name, success: true });
      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      results.push({ path, name, success: false, error: message });
      failureCount++;
    }
  }

  return { successCount, failureCount, results };
}

export async function saveDuplicateCleanupRecord(record: {
  files: { path: string; name: string; size: number }[];
  successCount: number;
  totalSize: number;
}): Promise<void> {
  await loadDatabase();
  const data = getData();

  if (!data.cleanups) data.cleanups = [];

  data.cleanups.unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    filesMoved: record.successCount,
    totalFiles: record.files.length,
    spaceRecovered: record.totalSize,
    files: record.files.map((f) => f.path),
  });

  await saveDatabase();
}
