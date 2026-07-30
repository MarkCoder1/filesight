import fs from 'fs/promises';
import path from 'path';

import type { ScannerConfig } from './types';
import type { RawEntry } from './fileMetadata';
import { getRawEntry } from './fileMetadata';
import { shouldSkipFile } from './scanUtils';

export interface CollectedFile {
  entry: RawEntry;
  depth: number;
}

export interface CollectorResult {
  files: CollectedFile[];
  errors: { path: string; message: string; code: string }[];
  totalCount: number;
}

async function listEntries(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

export async function collectFiles(
  dirPath: string,
  config: ScannerConfig,
  onCountUpdate?: (count: number) => void,
): Promise<CollectorResult> {
  const files: CollectedFile[] = [];
  const errors: { path: string; message: string; code: string }[] = [];
  const visited = new Set<string>();

  const resolvedPath = path.resolve(dirPath);
  visited.add(resolvedPath);

  const queue: { dir: string; depth: number }[] = [{ dir: resolvedPath, depth: 0 }];

  while (queue.length > 0) {
    const { dir, depth } = queue.shift()!;

    if (config.maxDepth !== undefined && depth >= config.maxDepth) {
      continue;
    }

    const names = await listEntries(dir);

    for (const name of names) {
      const rawEntry = await getRawEntry(dir, name);
      if (!rawEntry) continue;

      if (shouldSkipFile(name, rawEntry.fullPath, rawEntry.isSymlink, config)) {
        continue;
      }

      if (rawEntry.isDirectory && !rawEntry.isSymlink) {
        const normalizedDir = path.resolve(rawEntry.fullPath);
        if (!visited.has(normalizedDir)) {
          visited.add(normalizedDir);
          queue.push({ dir: normalizedDir, depth: depth + 1 });
        }
      }

      if (!rawEntry.isDirectory) {
        files.push({ entry: rawEntry, depth });
      }
    }

    onCountUpdate?.(files.length);
  }

  return { files, errors, totalCount: files.length };
}

export async function countFiles(dirPath: string, config: ScannerConfig): Promise<number> {
  let count = 0;
  const visited = new Set<string>();
  const resolvedPath = path.resolve(dirPath);
  visited.add(resolvedPath);

  const queue: { dir: string; depth: number }[] = [{ dir: resolvedPath, depth: 0 }];

  while (queue.length > 0) {
    const { dir, depth } = queue.shift()!;

    if (config.maxDepth !== undefined && depth >= config.maxDepth) continue;

    const names = await listEntries(dir);

    for (const name of names) {
      const rawEntry = await getRawEntry(dir, name);
      if (!rawEntry) continue;

      if (shouldSkipFile(name, rawEntry.fullPath, rawEntry.isSymlink, config)) continue;

      if (rawEntry.isDirectory && !rawEntry.isSymlink) {
        const normalizedDir = path.resolve(rawEntry.fullPath);
        if (!visited.has(normalizedDir)) {
          visited.add(normalizedDir);
          queue.push({ dir: normalizedDir, depth: depth + 1 });
        }
      }

      if (!rawEntry.isDirectory) {
        count++;
      }
    }
  }

  return count;
}
