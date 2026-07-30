import type { FileEntry } from '@/types';

export type SortOption =
  'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'date-desc' | 'date-asc';

export function sortFiles(files: FileEntry[], option: SortOption): FileEntry[] {
  const sorted = [...files];

  switch (option) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'size-desc':
      sorted.sort((a, b) => b.size - a.size);
      break;
    case 'size-asc':
      sorted.sort((a, b) => a.size - b.size);
      break;
    case 'date-desc':
      sorted.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
      break;
    case 'date-asc':
      sorted.sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime());
      break;
  }

  return sorted;
}

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'size-desc', label: 'Largest first' },
  { value: 'size-asc', label: 'Smallest first' },
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
];
