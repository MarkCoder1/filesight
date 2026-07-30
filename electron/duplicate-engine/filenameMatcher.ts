export interface NormalizedFileName {
  stem: string;
  extension: string;
}

const COPY_PATTERNS = [
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
];

export function normalizeFileName(name: string): NormalizedFileName {
  const extIndex = name.lastIndexOf('.');
  const extension = extIndex >= 0 ? name.slice(extIndex).toLowerCase() : '';
  let stem = extIndex >= 0 ? name.slice(0, extIndex) : name;

  for (const pattern of COPY_PATTERNS) {
    stem = stem.replace(pattern, '');
  }

  stem = stem.trim();

  return { stem, extension };
}

export function areFilenamesSimilar(nameA: string, nameB: string): boolean {
  const normA = normalizeFileName(nameA);
  const normB = normalizeFileName(nameB);

  if (normA.extension !== normB.extension) return false;
  if (normA.stem === '') return false;
  if (normB.stem === '') return false;

  if (normA.stem === normB.stem) return true;

  const a = normA.stem.toLowerCase();
  const b = normB.stem.toLowerCase();

  if (a === b) return true;

  if (a.length < 4 || b.length < 4) return false;

  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;

  if (longer.startsWith(shorter) && longer.length - shorter.length <= 3) return true;

  if (longer.includes(shorter) && Math.abs(longer.length - shorter.length) <= 2) return true;

  const threshold = 3;
  const distance = levenshteinDistance(a, b);
  if (distance <= threshold) return true;

  return false;
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[m][n];
}
