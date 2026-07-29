import { CATEGORY_LABELS } from './fileCategories';
import type { FileEntry } from '@/types';

export interface SearchQuery {
  text: string;
}

export function searchFiles(files: FileEntry[], query: SearchQuery): FileEntry[] {
  const q = query.text.trim().toLowerCase();
  if (!q) return files;

  return files.filter((file) => {
    if (file.name.toLowerCase().includes(q)) return true;

    if (file.extension.toLowerCase().replace(/^\./, '').includes(q)) return true;

    const label = CATEGORY_LABELS[file.category]?.toLowerCase() ?? '';
    if (label.includes(q)) return true;

    if (file.category.toLowerCase().includes(q)) return true;

    return false;
  });
}
