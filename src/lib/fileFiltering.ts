import type { FileCategory, FileEntry } from '@/types';

export interface FileFilters {
  category: FileCategory | 'all';
  size: 'all' | 'small' | 'medium' | 'large' | 'huge';
  date: 'all' | 'today' | 'week' | 'month' | 'old-6m' | 'old-1y';
}

const SIZE_BOUNDS: Record<
  Exclude<FileFilters['size'], 'all'>,
  { min: number; max: number }
> = {
  small: { min: 0, max: 10 * 1024 * 1024 },
  medium: { min: 10 * 1024 * 1024, max: 500 * 1024 * 1024 },
  large: { min: 500 * 1024 * 1024, max: 2 * 1024 * 1024 * 1024 },
  huge: { min: 2 * 1024 * 1024 * 1024, max: Infinity },
};

function msAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

const DATE_CUTOFFS: Record<
  Exclude<FileFilters['date'], 'all'>,
  number
> = {
  today: msAgo(1),
  week: msAgo(7),
  month: msAgo(30),
  'old-6m': msAgo(180),
  'old-1y': msAgo(365),
};

export function filterFiles(files: FileEntry[], filters: FileFilters): FileEntry[] {
  let result = files;

  if (filters.category !== 'all') {
    result = result.filter((f) => f.category === filters.category);
  }

  if (filters.size !== 'all') {
    const bounds = SIZE_BOUNDS[filters.size];
    result = result.filter((f) => !f.isDirectory && f.size >= bounds.min && f.size < bounds.max);
  }

  if (filters.date !== 'all') {
    const cutoff = DATE_CUTOFFS[filters.date];

    if (filters.date === 'old-6m' || filters.date === 'old-1y') {
      const modifiedBefore = new Date(cutoff).getTime();
      result = result.filter((f) => new Date(f.modifiedAt).getTime() < modifiedBefore);
    } else {
      const modifiedAfter = new Date(cutoff).getTime();
      result = result.filter((f) => new Date(f.modifiedAt).getTime() >= modifiedAfter);
    }
  }

  return result;
}

export const SIZE_FILTERS: { value: FileFilters['size']; label: string }[] = [
  { value: 'all', label: 'All files' },
  { value: 'small', label: 'Small (<10 MB)' },
  { value: 'medium', label: 'Medium (10–500 MB)' },
  { value: 'large', label: 'Large (500 MB–2 GB)' },
  { value: 'huge', label: 'Huge (>2 GB)' },
];

export const DATE_FILTERS: { value: FileFilters['date']; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' },
  { value: 'old-6m', label: 'Older than 6 months' },
  { value: 'old-1y', label: 'Older than 1 year' },
];
