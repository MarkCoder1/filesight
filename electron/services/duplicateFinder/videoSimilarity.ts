import { stat } from 'fs/promises';
import path from 'path';

const VIDEO_EXTENSIONS = new Set([
  '.mp4', '.mov', '.avi', '.mkv', '.webm',
  '.flv', '.wmv', '.m4v', '.3gp', '.ts',
]);

export function isVideoFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return VIDEO_EXTENSIONS.has(ext);
}

export interface VideoMetadata {
  size: number;
  extension: string;
  fileName: string;
  modifiedAt: Date;
}

export async function getVideoMetadata(filePath: string): Promise<VideoMetadata | null> {
  try {
    const fileStat = await stat(filePath);
    return {
      size: fileStat.size,
      extension: path.extname(filePath).toLowerCase(),
      fileName: path.basename(filePath),
      modifiedAt: fileStat.mtime,
    };
  } catch {
    return null;
  }
}

export function computeVideoSimilarity(
  metaA: VideoMetadata,
  metaB: VideoMetadata,
): number {
  if (metaA.extension !== metaB.extension) return 0;

  const sizeRatio = metaA.size / metaB.size;
  const sizeSimilarity = sizeRatio < 1 ? sizeRatio : 1 / sizeRatio;

  const timeDiff = Math.abs(metaA.modifiedAt.getTime() - metaB.modifiedAt.getTime());
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  const timeSimilarity = Math.max(0, 1 - daysDiff / 30);

  const fileNameSimilarity = computeFileNameSimilarity(metaA.fileName, metaB.fileName);

  const score = sizeSimilarity * 0.5 + timeSimilarity * 0.2 + fileNameSimilarity * 0.3;
  return Math.max(0, Math.min(1, score));
}

function computeFileNameSimilarity(nameA: string, nameB: string): number {
  const a = nameA.toLowerCase().replace(/\.[^.]+$/, '');
  const b = nameB.toLowerCase().replace(/\.[^.]+$/, '');

  if (a === b) return 1;

  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;

  return Math.max(0, 1 - distance / maxLen);
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) dp[i] = [i];
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[m][n];
}
