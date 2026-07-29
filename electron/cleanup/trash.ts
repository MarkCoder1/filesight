import { shell } from 'electron';

import type { CleanupFileResult, CleanupResult } from './types';

export async function trashFiles(
  paths: { path: string; name: string }[],
  onProgress?: (current: number, total: number, currentFile: string) => void,
): Promise<CleanupResult> {
  const results: CleanupFileResult[] = [];
  let successCount = 0;
  let failureCount = 0;
  let totalSize = 0;

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

  return { successCount, failureCount, totalSize, results };
}
