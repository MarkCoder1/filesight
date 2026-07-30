import { create } from 'zustand';

import { filterFiles, type FileFilters } from '@/lib/fileFiltering';
import { searchFiles, type SearchQuery } from '@/lib/fileSearch';
import { sortFiles, type SortOption } from '@/lib/fileSorting';
import type { FileEntry } from '@/types';

export interface ExplorerState {
  files: FileEntry[];
  searchQuery: SearchQuery;
  activeFilters: FileFilters;
  sortOption: SortOption;
  selectedFiles: Set<string>;

  setFiles: (files: FileEntry[]) => void;
  setSearchQuery: (query: SearchQuery) => void;
  setActiveFilters: (filters: FileFilters) => void;
  setSortOption: (option: SortOption) => void;
  toggleFileSelection: (fileId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  removeFiles: (paths: string[]) => void;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  files: [],
  searchQuery: { text: '' },
  activeFilters: { category: 'all', size: 'all', date: 'all' },
  sortOption: 'name-asc',
  selectedFiles: new Set(),

  setFiles: (files) => set({ files, selectedFiles: new Set() }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setActiveFilters: (activeFilters) => set({ activeFilters }),

  setSortOption: (sortOption) => set({ sortOption }),

  toggleFileSelection: (fileId) =>
    set((state) => {
      const next = new Set(state.selectedFiles);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return { selectedFiles: next };
    }),

  selectAll: () =>
    set((state) => {
      const filtered = applyAll(state);
      return { selectedFiles: new Set(filtered.map((f) => f.id)) };
    }),

  clearSelection: () => set({ selectedFiles: new Set() }),

  removeFiles: (paths) =>
    set((state) => {
      const removedIds = new Set(
        state.files.filter((f) => paths.includes(f.path)).map((f) => f.id),
      );
      const files = state.files.filter((f) => !removedIds.has(f.id));
      const nextSelected = new Set(state.selectedFiles);
      for (const id of removedIds) nextSelected.delete(id);
      return { files, selectedFiles: nextSelected };
    }),
}));

function applyAll(state: ExplorerState): FileEntry[] {
  let result = state.files;
  result = searchFiles(result, state.searchQuery);
  result = filterFiles(result, state.activeFilters);
  result = sortFiles(result, state.sortOption);
  return result;
}
