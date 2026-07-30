import path from 'path';

import { areFilenamesSimilar, computeFilenameSimilarity } from './filenameAnalyzer';
import { calculateChunkHash, calculateFullHash, validateFileAccess } from './hashEngine';
import {
  computeImageSimilarity,
  computePerceptualHash,
  getImageResolution,
  isImageFile,
} from './imageSimilarity';
import { computeDocumentSimilarity, extractText, isDocumentFile, tokenize } from './documentSimilarity';
import {
  computeVideoSimilarity,
  getVideoMetadata,
  isVideoFile,
} from './videoSimilarity';
import type {
  DuplicateFileInfo,
  DuplicateGroup,
  DuplicateScanProgress,
  DuplicateScanResult,
  ScanFile,
} from './types';
import { recommendBestFile } from './cleanupManager';

const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024;
const DOCUMENT_SIMILARITY_THRESHOLD = 0.7;
const IMAGE_SIMILARITY_THRESHOLD = 0.8;
const VIDEO_SIMILARITY_THRESHOLD = 0.7;

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
    if (existing) existing.push(file);
    else groups.set(file.size, [file]);
  }
  return groups;
}

function groupByExtension(files: ScanFile[]): ScanFile[] {
  const groups = new Map<string, ScanFile[]>();
  for (const file of files) {
    const ext = file.extension || '(none)';
    const existing = groups.get(ext);
    if (existing) existing.push(file);
    else groups.set(ext, [file]);
  }
  const candidates: ScanFile[] = [];
  for (const group of groups.values()) {
    if (group.length >= 2) candidates.push(...group);
  }
  return candidates;
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

export async function scanDuplicates(
  files: { path: string; name: string; size: number; modifiedAt: Date }[],
  onProgress?: (progress: DuplicateScanProgress) => void,
  signal?: AbortSignal,
): Promise<DuplicateScanResult> {
  if (signal?.aborted) return emptyResult();

  const allFiles = collectFiles(files);
  const totalFiles = allFiles.length;
  const matchedPaths = new Set<string>();
  const duplicateGroups: DuplicateGroup[] = [];
  let groupId = 0;

  emitProgress(onProgress, 'metadata', '', 0, totalFiles, 0);
  if (signal?.aborted) return emptyResult();

  const sizeGroups = groupBySize(allFiles);
  const candidates: ScanFile[] = [];
  for (const group of sizeGroups.values()) {
    if (group.length >= 2) candidates.push(...group);
    if (signal?.aborted) return emptyResult();
  }

  const candidatesByExt = groupByExtension(candidates);
  if (candidatesByExt.length === 0) return emptyResult();

  // Level 1: Exact duplicates (size + SHA-256)
  emitProgress(onProgress, 'hashing', '', 0, totalFiles, 5);
  if (signal?.aborted) return emptyResult();

  const hashToFiles = new Map<string, DuplicateFileInfo[]>();
  let processedFiles = 0;

  for (const file of candidatesByExt) {
    if (signal?.aborted) return emptyResult();

    try {
      await validateFileAccess(file.path);

      const useChunkHash = file.size > LARGE_FILE_THRESHOLD;
      const hashFn = useChunkHash ? calculateChunkHash : calculateFullHash;
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
      if (existing) existing.push(info);
      else hashToFiles.set(hash, [info]);
    } catch {
      // skip unreadable files
    }

    processedFiles++;
    const percentage = 5 + Math.round((processedFiles / candidatesByExt.length) * 40);
    emitProgress(onProgress, 'hashing', file.name, processedFiles, candidatesByExt.length, percentage);
  }

  if (signal?.aborted) return emptyResult();

  for (const [hash, dupFiles] of hashToFiles.entries()) {
    if (dupFiles.length >= 2) {
      const totalSize = dupFiles.reduce((s, f) => s + f.size, 0);
      const wastedSpace = totalSize - dupFiles[0].size;

      const recommended = recommendBestFile(dupFiles.map((f) => ({
        path: f.path,
        name: f.name,
        size: f.size,
        modifiedAt: f.modifiedAt instanceof Date ? f.modifiedAt : new Date(f.modifiedAt),
        resolution: f.resolution ?? undefined,
        matchType: f.matchType,
      })));
      for (const f of dupFiles) {
        f.isRecommended = f.path === recommended?.path;
      }

      duplicateGroups.push({
        id: `dup-${groupId++}`,
        hash,
        files: dupFiles,
        totalSize,
        wastedSpace,
        confidence: 'exact',
        matchType: 'hash-exact',
        detectionLevel: 1,
      });

      for (const f of dupFiles) matchedPaths.add(f.path);
    }
  }

  if (signal?.aborted) return emptyResult();

  // Level 2: Similar files (images, documents, videos)
  emitProgress(onProgress, 'perceptual', '', 0, totalFiles, 50);

  // --- Similar images ---
  const unmatchedImages = candidatesByExt.filter(
    (f) => isImageFile(f.path) && !matchedPaths.has(f.path),
  );

  if (unmatchedImages.length >= 2) {
    const imageGroups = await findImageDuplicateGroups(unmatchedImages, groupId, signal, (processed, total) => {
      const percentage = 50 + Math.round((processed / total) * 15);
      emitProgress(onProgress, 'perceptual', unmatchedImages[processed]?.name || '', processed, total, percentage);
    });
    for (const g of imageGroups) {
      g.id = `dup-${groupId++}`;
      for (const f of g.files) matchedPaths.add(f.path);
      duplicateGroups.push(g);
    }
  }

  if (signal?.aborted) return emptyResult();

  // --- Similar documents ---
  emitProgress(onProgress, 'document', '', 0, totalFiles, 65);
  const unmatchedDocs = candidatesByExt.filter(
    (f) => isDocumentFile(f.path) && !matchedPaths.has(f.path),
  );

  if (unmatchedDocs.length >= 2) {
    const docGroups = await findDocumentDuplicateGroups(unmatchedDocs, groupId, signal, (processed, total) => {
      const percentage = 65 + Math.round((processed / total) * 15);
      emitProgress(onProgress, 'document', unmatchedDocs[processed]?.name || '', processed, total, percentage);
    });
    for (const g of docGroups) {
      g.id = `dup-${groupId++}`;
      for (const f of g.files) matchedPaths.add(f.path);
      duplicateGroups.push(g);
    }
  }

  if (signal?.aborted) return emptyResult();

  // --- Similar videos ---
  emitProgress(onProgress, 'video', '', 0, totalFiles, 80);
  const unmatchedVideos = candidatesByExt.filter(
    (f) => isVideoFile(f.path) && !matchedPaths.has(f.path),
  );

  if (unmatchedVideos.length >= 2) {
    const videoGroups = await findVideoDuplicateGroups(unmatchedVideos, groupId, signal, (processed, total) => {
      const percentage = 80 + Math.round((processed / total) * 5);
      emitProgress(onProgress, 'video', unmatchedVideos[processed]?.name || '', processed, total, percentage);
    });
    for (const g of videoGroups) {
      g.id = `dup-${groupId++}`;
      for (const f of g.files) matchedPaths.add(f.path);
      duplicateGroups.push(g);
    }
  }

  if (signal?.aborted) return emptyResult();

  // Level 3: Filename-based duplicates
  emitProgress(onProgress, 'filename', '', 0, totalFiles, 85);
  const unmatchedByName = candidatesByExt.filter((f) => !matchedPaths.has(f.path));

  if (unmatchedByName.length >= 2) {
    const filenameGroups = findFilenameDuplicateGroups(unmatchedByName, groupId);
    for (const g of filenameGroups) {
      g.id = `dup-${groupId++}`;
      for (const f of g.files) matchedPaths.add(f.path);
      duplicateGroups.push(g);
    }
  }

  // Apply recommendations to all groups
  emitProgress(onProgress, 'recommending', '', 0, totalFiles, 95);
  for (const group of duplicateGroups) {
    const recommended = recommendBestFile(group.files.map((f) => ({
      path: f.path,
      name: f.name,
      size: f.size,
      modifiedAt: f.modifiedAt instanceof Date ? f.modifiedAt : new Date(f.modifiedAt),
      resolution: f.resolution ?? undefined,
      matchType: f.matchType,
    })));
    if (recommended) {
      for (const f of group.files) {
        f.isRecommended = f.path === recommended.path;
      }
    }
  }

  emitProgress(onProgress, 'recommending', '', totalFiles, totalFiles, 100);
  if (signal?.aborted) return emptyResult();

  return buildResult(duplicateGroups);
}

async function findImageDuplicateGroups(
  files: ScanFile[],
  startId: number,
  signal?: AbortSignal,
  onProgress?: (processed: number, total: number) => void,
): Promise<DuplicateGroup[]> {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<number>();

  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) return groups;
    if (processed.has(i)) continue;

    try {
      const hashI = await computePerceptualHash(files[i].path);
      const resolutionI = await getImageResolution(files[i].path);

      const similarFiles: DuplicateFileInfo[] = [
        {
          path: files[i].path,
          name: files[i].name,
          size: files[i].size,
          modifiedAt: files[i].modifiedAt,
          hash: hashI,
          confidence: 'similar',
          matchType: 'perceptual',
          similarity: 1,
          resolution: resolutionI,
        },
      ];
      processed.add(i);

      for (let j = i + 1; j < files.length; j++) {
        if (signal?.aborted) return groups;
        if (processed.has(j)) continue;

        try {
          const hashJ = await computePerceptualHash(files[j].path);
          const similarity = computeImageSimilarity(hashI, hashJ);

          if (similarity >= IMAGE_SIMILARITY_THRESHOLD) {
            const resolutionJ = await getImageResolution(files[j].path);
            similarFiles.push({
              path: files[j].path,
              name: files[j].name,
              size: files[j].size,
              modifiedAt: files[j].modifiedAt,
              hash: hashJ,
              confidence: 'similar',
              matchType: 'perceptual',
              similarity,
              resolution: resolutionJ,
            });
            processed.add(j);
          }
        } catch {
          // skip
        }
      }

      if (similarFiles.length >= 2) {
        const totalSize = similarFiles.reduce((s, f) => s + f.size, 0);
        const wastedSpace = totalSize - similarFiles[0].size;

        const bestFile = recommendBestFile(similarFiles.map((f) => ({
          path: f.path,
          name: f.name,
          size: f.size,
          modifiedAt: f.modifiedAt instanceof Date ? f.modifiedAt : new Date(f.modifiedAt),
          resolution: f.resolution ?? undefined,
          matchType: f.matchType,
        })));
        for (const f of similarFiles) {
          f.isRecommended = f.path === bestFile?.path;
        }

        groups.push({
          id: '',
          hash: hashI,
          files: similarFiles,
          totalSize,
          wastedSpace,
          confidence: 'similar',
          matchType: 'perceptual',
          detectionLevel: 2,
        });
      }
    } catch {
      // skip
    }

    onProgress?.(i + 1, files.length);
  }

  return groups;
}

async function findDocumentDuplicateGroups(
  files: ScanFile[],
  startId: number,
  signal?: AbortSignal,
  onProgress?: (processed: number, total: number) => void,
): Promise<DuplicateGroup[]> {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<number>();

  // Pre-extract texts
  const texts = new Map<string, string | null>();
  for (const file of files) {
    if (signal?.aborted) return groups;
    const text = await extractText(file.path, file.extension);
    texts.set(file.path, text);
    onProgress?.(files.indexOf(file) + 1, files.length);
  }

  if (signal?.aborted) return groups;

  for (let i = 0; i < files.length; i++) {
    if (processed.has(i)) continue;

    const textI = texts.get(files[i].path);
    if (!textI) { processed.add(i); continue; }

    const similarFiles: DuplicateFileInfo[] = [
      {
        path: files[i].path,
        name: files[i].name,
        size: files[i].size,
        modifiedAt: files[i].modifiedAt,
        hash: 'document-similar',
        confidence: 'similar',
        matchType: 'document-similar',
        similarity: 1,
      },
    ];
    processed.add(i);

    for (let j = i + 1; j < files.length; j++) {
      if (processed.has(j)) continue;

      const textJ = texts.get(files[j].path);
      if (!textJ) { processed.add(j); continue; }

      const similarity = computeDocumentSimilarity(textI, textJ);

      if (similarity >= DOCUMENT_SIMILARITY_THRESHOLD) {
        similarFiles.push({
          path: files[j].path,
          name: files[j].name,
          size: files[j].size,
          modifiedAt: files[j].modifiedAt,
          hash: 'document-similar',
          confidence: 'similar',
          matchType: 'document-similar',
          similarity,
        });
        processed.add(j);
      }
    }

    if (similarFiles.length >= 2) {
      const totalSize = similarFiles.reduce((s, f) => s + f.size, 0);
      const wastedSpace = totalSize - similarFiles[0].size;

      const bestFile = recommendBestFile(similarFiles.map((f) => ({
        path: f.path,
        name: f.name,
        size: f.size,
        modifiedAt: f.modifiedAt instanceof Date ? f.modifiedAt : new Date(f.modifiedAt),
        matchType: f.matchType,
      })));
      for (const f of similarFiles) f.isRecommended = f.path === bestFile?.path;

      groups.push({
        id: '',
        hash: 'document-similar',
        files: similarFiles,
        totalSize,
        wastedSpace,
        confidence: 'similar',
        matchType: 'document-similar',
        detectionLevel: 2,
      });
    }
  }

  return groups;
}

async function findVideoDuplicateGroups(
  files: ScanFile[],
  startId: number,
  signal?: AbortSignal,
  onProgress?: (processed: number, total: number) => void,
): Promise<DuplicateGroup[]> {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<number>();

  const metadataMap = new Map<string, Awaited<ReturnType<typeof getVideoMetadata>>>();
  for (const file of files) {
    if (signal?.aborted) return groups;
    const meta = await getVideoMetadata(file.path);
    metadataMap.set(file.path, meta);
  }

  for (let i = 0; i < files.length; i++) {
    if (processed.has(i)) continue;

    const metaI = metadataMap.get(files[i].path);
    if (!metaI) { processed.add(i); continue; }

    const similarFiles: DuplicateFileInfo[] = [
      {
        path: files[i].path,
        name: files[i].name,
        size: files[i].size,
        modifiedAt: files[i].modifiedAt,
        hash: 'video-similar',
        confidence: 'similar',
        matchType: 'video-similar',
        similarity: 1,
      },
    ];
    processed.add(i);

    for (let j = i + 1; j < files.length; j++) {
      if (processed.has(j)) continue;

      const metaJ = metadataMap.get(files[j].path);
      if (!metaJ) { processed.add(j); continue; }

      const similarity = computeVideoSimilarity(metaI, metaJ);

      if (similarity >= VIDEO_SIMILARITY_THRESHOLD) {
        similarFiles.push({
          path: files[j].path,
          name: files[j].name,
          size: files[j].size,
          modifiedAt: files[j].modifiedAt,
          hash: 'video-similar',
          confidence: 'similar',
          matchType: 'video-similar',
          similarity,
        });
        processed.add(j);
      }
    }

    if (similarFiles.length >= 2) {
      const totalSize = similarFiles.reduce((s, f) => s + f.size, 0);
      const wastedSpace = totalSize - similarFiles[0].size;

      const bestFile = recommendBestFile(similarFiles.map((f) => ({
        path: f.path,
        name: f.name,
        size: f.size,
        modifiedAt: f.modifiedAt instanceof Date ? f.modifiedAt : new Date(f.modifiedAt),
        matchType: f.matchType,
      })));
      for (const f of similarFiles) f.isRecommended = f.path === bestFile?.path;

      groups.push({
        id: '',
        hash: 'video-similar',
        files: similarFiles,
        totalSize,
        wastedSpace,
        confidence: 'similar',
        matchType: 'video-similar',
        detectionLevel: 2,
      });
    }

    onProgress?.(i + 1, files.length);
  }

  return groups;
}

function findFilenameDuplicateGroups(
  files: ScanFile[],
  startId: number,
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const matched = new Set<number>();

  for (let i = 0; i < files.length; i++) {
    if (matched.has(i)) continue;

    const similar: ScanFile[] = [files[i]];
    matched.add(i);

    for (let j = i + 1; j < files.length; j++) {
      if (matched.has(j)) continue;

      const similarity = computeFilenameSimilarity(files[i].name, files[j].name);
      if (similarity >= 0.5) {
        similar.push(files[j]);
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
        confidence: 'strong' as const,
        matchType: 'filename-similar' as const,
        similarity: computeFilenameSimilarity(similar[0].name, f.name),
      }));

      const bestFile = recommendBestFile(groupFiles.map((f) => ({
        path: f.path,
        name: f.name,
        size: f.size,
        modifiedAt: f.modifiedAt instanceof Date ? f.modifiedAt : new Date(f.modifiedAt),
        matchType: f.matchType,
      })));
      for (const f of groupFiles) f.isRecommended = f.path === bestFile?.path;

      groups.push({
        id: '',
        hash: 'filename-match',
        files: groupFiles,
        totalSize,
        wastedSpace,
        confidence: 'strong',
        matchType: 'filename-similar',
        detectionLevel: 3,
      });
    }
  }

  return groups;
}

function buildResult(groups: DuplicateGroup[]): DuplicateScanResult {
  const sorted = groups.sort((a, b) => b.wastedSpace - a.wastedSpace);

  const totalDuplicates = sorted.reduce((sum, g) => sum + g.files.length, 0);
  const wastedSpace = sorted.reduce((sum, g) => sum + g.wastedSpace, 0);

  const categories = {
    exact: sorted.filter((g) => g.detectionLevel === 1).length,
    similarImages: sorted.filter((g) => g.matchType === 'perceptual').length,
    similarDocuments: sorted.filter((g) => g.matchType === 'document-similar').length,
    filename: sorted.filter((g) => g.detectionLevel === 3).length,
  };

  return { duplicateGroups: sorted, totalDuplicates, wastedSpace, categories };
}

function emptyResult(): DuplicateScanResult {
  return { duplicateGroups: [], totalDuplicates: 0, wastedSpace: 0, categories: { exact: 0, similarImages: 0, similarDocuments: 0, filename: 0 } };
}
