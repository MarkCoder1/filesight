const COPY_PATTERNS: RegExp[] = [
  /[-_\s]copy\s*\d*$/i,
  /[-_\s]kopie\s*\d*$/i,
  /[-_\s]duplicate\s*\d*$/i,
  /[-_\s]dupe\s*\d*$/i,
  /[-_\s]original$/i,
  /[-_\s]orig$/i,
  /\s*\(\d+\)\s*$/,
  /\s*\[\d+\]\s*$/,
  /[-_\s]\d+$/,
  /\s+-\s+copy$/i,
  /[-_\s]copy$/i,
  /[-_\s]\(copy\)\s*\d*$/i,
  /[-_\s]\(another\s+copy\)\s*\d*$/i,
  /\s+\(conflicted\s+copy\s+[\w\s\-]+\)\s*$/i,
  /[-_\s]backup\s*\d*$/i,
  /[-_\s]final\s*$/i,
  /[-_\s]v?\d+(\.\d+)*$/i,
];

export interface NormalizedFileName {
  stem: string;
  extension: string;
  suffix: string | null;
}

export function normalizeFileName(name: string): NormalizedFileName {
  const extIndex = name.lastIndexOf('.');
  const extension = extIndex >= 0 ? name.slice(extIndex).toLowerCase() : '';
  let stem = extIndex >= 0 ? name.slice(0, extIndex) : name;
  let suffix: string | null = null;

  for (const pattern of COPY_PATTERNS) {
    const match = stem.match(pattern);
    if (match) {
      suffix = match[0].trim();
      stem = stem.replace(pattern, '');
      break;
    }
  }

  stem = stem.trim();
  return { stem, extension, suffix };
}

export function computeFilenameSimilarity(nameA: string, nameB: string): number {
  const normA = normalizeFileName(nameA);
  const normB = normalizeFileName(nameB);

  if (normA.extension !== normB.extension) return 0;
  if (normA.stem === '' || normB.stem === '') return 0;

  const stemA = normA.stem.toLowerCase();
  const stemB = normB.stem.toLowerCase();

  if (stemA === stemB) return 1;

  const distance = levenshteinDistance(stemA, stemB);
  const maxLen = Math.max(stemA.length, stemB.length);
  if (maxLen === 0) return 0;

  const similarity = 1 - distance / maxLen;
  return Math.max(0, Math.min(1, similarity));
}

export function areFilenamesSimilar(nameA: string, nameB: string): boolean {
  return computeFilenameSimilarity(nameA, nameB) >= 0.6;
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
