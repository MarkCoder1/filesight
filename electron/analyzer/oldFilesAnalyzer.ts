import type { FileEntry } from '../../src/types';
import type { OldFilesResult } from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function findOldFiles(files: FileEntry[]): OldFilesResult {
  const now = Date.now();
  const sixMonths = now - 180 * MS_PER_DAY;
  const oneYear = now - 365 * MS_PER_DAY;
  const twoYears = now - 730 * MS_PER_DAY;

  const old6m: { name: string; path: string; size: number; ageDays: number }[] = [];
  const old1y: { name: string; path: string; size: number; ageDays: number }[] = [];
  const old2y: { name: string; path: string; size: number; ageDays: number }[] = [];

  for (const file of files) {
    if (file.isDirectory) continue;

    const modified = new Date(file.modifiedAt).getTime();
    const ageDays = Math.round((now - modified) / MS_PER_DAY);

    if (modified < twoYears) {
      old2y.push({ name: file.name, path: file.path, size: file.size, ageDays });
      old1y.push({ name: file.name, path: file.path, size: file.size, ageDays });
      old6m.push({ name: file.name, path: file.path, size: file.size, ageDays });
    } else if (modified < oneYear) {
      old1y.push({ name: file.name, path: file.path, size: file.size, ageDays });
      old6m.push({ name: file.name, path: file.path, size: file.size, ageDays });
    } else if (modified < sixMonths) {
      old6m.push({ name: file.name, path: file.path, size: file.size, ageDays });
    }
  }

  const sortByAge = (arr: typeof old6m) => arr.sort((a, b) => b.ageDays - a.ageDays);

  return {
    olderThan6Months: old6m.length,
    olderThan1Year: old1y.length,
    olderThan2Years: old2y.length,
    files: sortByAge(old6m).slice(0, 20),
  };
}
