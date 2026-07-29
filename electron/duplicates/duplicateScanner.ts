import { stat } from 'fs/promises';
import path from 'path';

import { calculateFileHash, validatePath } from './hashCalculator';
import type { DuplicateFileInfo, DuplicateGroup, DuplicateScanProgress } from './types';

interface ScanFile {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  extension: string;
}

function collectFiles(
  filePaths: { path: string; name: string; size: number; modifiedAt: Date }[],
): ScanFile[] {
  return filePaths.map((f) => ({
    path: f.path,
    name: f.name,
    size: f.size,
    modifiedAt: f.modifiedAt,
    extension: path.extname(f.name).toLowerCase(),
  }));
}

function groupBySize(files: ScanFile[]): Map<number, ScanFile[]> {
  const groups = new Map<number, ScanFile[]>();
  for (const file of files) {
    const existing = groups.get(file.size);
    if (existing) {
      existing.push(file);
    } else {
      groups.set(file.size, [file]);
    }
  }
  return groups;
}

function groupByExtension(files: ScanFile[]): ScanFile[] {
  const groups = new Map<string, ScanFile[]>();
  for (const file of files) {
    const ext = file.extension || '(none)';
    const existing = groups.get(ext);
    if (existing) {
      existing.push(file);
    } else {
      groups.set(ext, [file]);
    }
  }
  const candidates: ScanFile[] = [];
  for (const group of groups.values()) {
    if (group.length >= 2) {
      candidates.push(...group);
    }
  }
  return candidates;
}

export async function scanDuplicates(
  files: { path: string; name: string; size: number; modifiedAt: Date }[],
  onProgress?: (progress: DuplicateScanProgress) => void,
  signal?: AbortSignal,
): Promise<DuplicateGroup[]> {
  const allFiles = collectFiles(files);
  const totalFiles = allFiles.length;

  if (signal?.aborted) return [];

  const sizeGroups = groupBySize(allFiles);

  const candidates: ScanFile[] = [];
  for (const group of sizeGroups.values()) {
    if (group.length >= 2) {
      candidates.push(...group);
    }
    if (signal?.aborted) return [];
  }

  const candidatesByExt = groupByExtension(candidates);

  if (candidatesByExt.length === 0) return [];

  if (signal?.aborted) return [];

  const hashToFiles = new Map<string, DuplicateFileInfo[]>();
  let processedFiles = 0;

  const percentTotal = candidatesByExt.length;

  for (const file of candidatesByExt) {
    if (signal?.aborted) return [];

    try {
      await validatePath(file.path);
      const { hash } = await calculateFileHash(file.path, signal);

      const info: DuplicateFileInfo = {
        path: file.path,
        name: file.name,
        size: file.size,
        modifiedAt: file.modifiedAt,
        hash,
      };

      const existing = hashToFiles.get(hash);
      if (existing) {
        existing.push(info);
      } else {
        hashToFiles.set(hash, [info]);
      }
    } catch {
      // skip files that can't be read
    }

    processedFiles++;

    onProgress?.({
      currentFile: file.name,
      processedFiles,
      totalFiles: percentTotal,
      percentage: Math.round((processedFiles / percentTotal) * 100),
    });
  }

  const duplicateGroups: DuplicateGroup[] = [];
  let groupId = 0;

  for (const [hash, dupFiles] of hashToFiles.entries()) {
    if (dupFiles.length >= 2) {
      const totalSize = dupFiles[0].size * dupFiles.length;
      const wastedSpace = dupFiles[0].size * (dupFiles.length - 1);

      duplicateGroups.push({
        id: `dup-${groupId++}`,
        hash,
        files: dupFiles,
        totalSize,
        wastedSpace,
      });
    }
  }

  return duplicateGroups.sort((a, b) => b.wastedSpace - a.wastedSpace);
}
