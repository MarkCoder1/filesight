'use client';

import { useMemo, useState } from 'react';

import type { FileCategory, FileEntry } from '@/types';

export type SizeRange = 'all' | 'small' | 'medium' | 'large' | 'huge';
export type SortField = 'name' | 'size' | 'modifiedAt' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface FileFiltersState {
  search: string;
  category: FileCategory | 'all';
  sizeRange: SizeRange;
  sortBy: SortField;
  sortOrder: SortOrder;
}

const SIZE_RANGES: Record<SizeRange, { min: number; max: number } | null> = {
  all: null,
  small: { min: 0, max: 1024 * 1024 },
  medium: { min: 1024 * 1024, max: 10 * 1024 * 1024 },
  large: { min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
  huge: { min: 100 * 1024 * 1024, max: Infinity },
};

export interface UseFileFiltersReturn {
  filters: FileFiltersState;
  setSearch: (search: string) => void;
  setCategory: (category: FileCategory | 'all') => void;
  setSizeRange: (range: SizeRange) => void;
  setSortBy: (field: SortField) => void;
  toggleSortOrder: () => void;
  filtered: FileEntry[];
  totalCount: number;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: FileFiltersState = {
  search: '',
  category: 'all',
  sizeRange: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

export function useFileFilters(files: FileEntry[]): UseFileFiltersReturn {
  const [filters, setFilters] = useState<FileFiltersState>(DEFAULT_FILTERS);

  const setSearch = (search: string) => setFilters((prev) => ({ ...prev, search }));
  const setCategory = (category: FileCategory | 'all') => setFilters((prev) => ({ ...prev, category }));
  const setSizeRange = (sizeRange: SizeRange) => setFilters((prev) => ({ ...prev, sizeRange }));
  const setSortBy = (sortBy: SortField) => setFilters((prev) => ({ ...prev, sortBy }));
  const toggleSortOrder = () =>
    setFilters((prev) => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.sizeRange !== 'all';

  const filtered = useMemo(() => {
    let result = [...files];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }

    if (filters.category !== 'all') {
      result = result.filter((f) => f.category === filters.category);
    }

    if (filters.sizeRange !== 'all') {
      const range = SIZE_RANGES[filters.sizeRange];
      if (range) {
        result = result.filter((f) => !f.isDirectory && f.size >= range.min && f.size < range.max);
      }
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'size':
          cmp = a.size - b.size;
          break;
        case 'modifiedAt':
          cmp = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
      }
      return filters.sortOrder === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [files, filters]);

  return {
    filters,
    setSearch,
    setCategory,
    setSizeRange,
    setSortBy,
    toggleSortOrder,
    filtered,
    totalCount: filtered.length,
    resetFilters,
    hasActiveFilters,
  };
}
