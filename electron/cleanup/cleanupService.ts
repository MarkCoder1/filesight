import type { CleanupResult } from './types';
import { trashFiles } from './trash';

export interface PreviewInput {
  path: string;
  name: string;
  size: number;
}

export async function executeCleanup(
  files: PreviewInput[],
  onProgress?: (current: number, total: number, currentFile: string) => void,
): Promise<CleanupResult> {
  const paths = files.map((f) => ({ path: f.path, name: f.name }));
  return trashFiles(paths, onProgress);
}

export type { CleanupResult, CleanupProgress } from './types';
