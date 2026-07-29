'use client';

import { create } from 'zustand';

import type { DuplicateGroup, DuplicateScanProgress, DuplicateScanResult } from '@/types';

export type DuplicateScanStatus = 'idle' | 'scanning' | 'complete' | 'error';

export interface DuplicateState {
  status: DuplicateScanStatus;
  groups: DuplicateGroup[];
  progress: DuplicateScanProgress | null;
  result: DuplicateScanResult | null;
  error: string | null;
  selectedFilePaths: Set<string>;

  setScanning: () => void;
  setProgress: (progress: DuplicateScanProgress) => void;
  setComplete: (result: DuplicateScanResult) => void;
  setError: (error: string) => void;
  reset: () => void;
  toggleFileSelection: (path: string) => void;
  selectAllExceptOne: (group: DuplicateGroup) => void;
  clearSelection: () => void;
}

export const useDuplicateStore = create<DuplicateState>((set) => ({
  status: 'idle',
  groups: [],
  progress: null,
  result: null,
  error: null,
  selectedFilePaths: new Set(),

  setScanning: () => set({ status: 'scanning', progress: null, error: null }),

  setProgress: (progress) => set({ progress }),

  setComplete: (result) =>
    set({
      status: 'complete',
      groups: result.duplicateGroups,
      result,
      progress: null,
    }),

  setError: (error) => set({ status: 'error', error }),

  reset: () =>
    set({
      status: 'idle',
      groups: [],
      progress: null,
      result: null,
      error: null,
      selectedFilePaths: new Set(),
    }),

  toggleFileSelection: (path) =>
    set((state) => {
      const next = new Set(state.selectedFilePaths);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return { selectedFilePaths: next };
    }),

  selectAllExceptOne: (group) =>
    set(() => {
      const paths = new Set<string>();
      for (let i = 1; i < group.files.length; i++) {
        paths.add(group.files[i].path);
      }
      return { selectedFilePaths: paths };
    }),

  clearSelection: () => set({ selectedFilePaths: new Set() }),
}));
