import path from 'path';

import { areFilenamesSimilar } from './filenameMatcher';
import { calculateChunkHash, calculateFileHash, validatePath } from './hasher';
import { areImagesSimilar, computeDHash, isImageFile } from './imageHash';
import type {
  ConfidenceLevel,
  DuplicateFileInfo,
  DuplicateGroup,
  DuplicateScanProgress,
  MatchType,
  ScanFile,
} from './types';

const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024;

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
  if (signal?.aborted) return [];

  const allFiles = collectFiles(files);
  const totalFiles = allFiles.length;

  emitProgress(onProgress, 'metadata', '', 0, totalFiles, 0);
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

  emitProgress(onProgress, 'filename', '', 0, totalFiles, 10);
  if (signal?.aborted) return [];

  const hashToFiles = new Map<string, DuplicateFileInfo[]>();
  const processedSet = new Set<string>();
  let processedFiles = 0;

  for (const file of candidatesByExt) {
    if (signal?.aborted) return [];

    try {
      await validatePath(file.path);

      const useChunkHash = file.size > LARGE_FILE_THRESHOLD;
      const hashFn = useChunkHash ? calculateChunkHash : calculateFileHash;
      const { hash } = await hashFn(file.path, signal);

      const info: DuplicateFileInfo = {
        path: file.path,
        name: file.name,
        size: file.size,
        modifiedAt: file.modifiedAt,
        hash,
        confidence: 'exact',
        matchType: 'hash-exact',
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
    processedSet.add(file.path);

    const percentage = 10 + Math.round((processedFiles / candidatesByExt.length) * 80);
    emitProgress(onProgress, 'hashing', file.name, processedFiles, candidatesByExt.length, percentage);
  }

  if (signal?.aborted) return [];

  const duplicateGroups: DuplicateGroup[] = [];
  let groupId = 0;

  const matchedPaths = new Set<string>();

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
        confidence: 'exact',
        matchType: 'hash-exact',
      });

      for (const f of dupFiles) {
        matchedPaths.add(f.path);
      }
    }
  }

  const unmatchedBySize = new Map<number, ScanFile[]>();
  for (const group of sizeGroups.values()) {
    if (group.length < 2) continue;
    const unmatched = group.filter((f) => !matchedPaths.has(f.path));
    if (unmatched.length >= 2) {
      unmatchedBySize.set(group[0].size, unmatched);
    }
  }

  for (const [size, sizeGroup] of unmatchedBySize.entries()) {
    const matched = new Set<number>();

    for (let i = 0; i < sizeGroup.length; i++) {
      if (matched.has(i)) continue;

      const similar: ScanFile[] = [sizeGroup[i]];
      matched.add(i);

      for (let j = i + 1; j < sizeGroup.length; j++) {
        if (matched.has(j)) continue;
        if (areFilenamesSimilar(sizeGroup[i].name, sizeGroup[j].name)) {
          similar.push(sizeGroup[j]);
          matched.add(j);
        }
      }

      if (similar.length >= 2) {
        const totalSize = similar.reduce((s, f) => s + f.size, 0);
        const wastedSpace = totalSize - similar[0].size;

        const groupFiles: DuplicateFileInfo[] = similar.map((f) => ({
          path: f.path,
          name: f.name,
          size: f.size,
          modifiedAt: f.modifiedAt,
          hash: 'filename-match',
          confidence: 'strong' as ConfidenceLevel,
          matchType: 'filename-similar' as MatchType,
        }));

        duplicateGroups.push({
          id: `dup-${groupId++}`,
          hash: 'filename-match',
          files: groupFiles,
          totalSize,
          wastedSpace,
          confidence: 'strong',
          matchType: 'filename-similar',
        });

        for (const f of similar) {
          matchedPaths.add(f.path);
        }
      }
    }
  }

  if (signal?.aborted) return [];

  const unmatchedImages = candidatesByExt.filter(
    (f) => isImageFile(f.path) && !matchedPaths.has(f.path),
  );

  if (unmatchedImages.length >= 2) {
    const imageGroups = await findPerceptualDuplicates(unmatchedImages, signal, (processed, total) => {
      const percentage = 90 + Math.round((processed / total) * 10);
      emitProgress(onProgress, 'perceptual', unmatchedImages[processed]?.name || '', processed, total, percentage);
    });

    for (const pGroup of imageGroups) {
      duplicateGroups.push(pGroup);
    }
  }

  return duplicateGroups.sort((a, b) => b.wastedSpace - a.wastedSpace);
}

function emitProgress(
  onProgress: ((progress: DuplicateScanProgress) => void) | undefined,
  stage: DuplicateScanProgress['stage'],
  currentFile: string,
  processedFiles: number,
  totalFiles: number,
  percentage: number,
): void {
  onProgress?.({ stage, currentFile, processedFiles, totalFiles, percentage });
}

async function findPerceptualDuplicates(
  files: ScanFile[],
  signal?: AbortSignal,
  onProgress?: (processed: number, total: number) => void,
): Promise<DuplicateGroup[]> {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<number>();
  let groupId = 0;

  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) return groups;
    if (processed.has(i)) continue;

    try {
      const hashI = await computeDHash(files[i].path);
      const similarFiles: DuplicateFileInfo[] = [
        {
          path: files[i].path,
          name: files[i].name,
          size: files[i].size,
          modifiedAt: files[i].modifiedAt,
          hash: hashI,
          confidence: 'similar',
          matchType: 'perceptual',
        },
      ];
      processed.add(i);

      for (let j = i + 1; j < files.length; j++) {
        if (signal?.aborted) return groups;
        if (processed.has(j)) continue;

        try {
          const hashJ = await computeDHash(files[j].path);
          if (areImagesSimilar(hashI, hashJ)) {
            similarFiles.push({
              path: files[j].path,
              name: files[j].name,
              size: files[j].size,
              modifiedAt: files[j].modifiedAt,
              hash: hashJ,
              confidence: 'similar',
              matchType: 'perceptual',
            });
            processed.add(j);
          }
        } catch {
          // skip unreadable images
        }
      }

      if (similarFiles.length >= 2) {
        const totalSize = similarFiles.reduce((s, f) => s + f.size, 0);
        const wastedSpace = totalSize - similarFiles[0].size;
        groups.push({
          id: `dup-${groupId++}`,
          hash: hashI,
          files: similarFiles,
          totalSize,
          wastedSpace,
          confidence: 'similar',
          matchType: 'perceptual',
        });
      }
    } catch {
      // skip unreadable images
    }

    onProgress?.(i + 1, files.length);
  }

  return groups;
}

export function buildScanResult(groups: DuplicateGroup[]): {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  wastedSpace: number;
} {
  const totalDuplicates = groups.reduce((sum, g) => sum + g.files.length, 0);
  const wastedSpace = groups.reduce((sum, g) => sum + g.wastedSpace, 0);

  return {
    duplicateGroups: groups,
    totalDuplicates,
    wastedSpace,
  };
}
