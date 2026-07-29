'use client';

import { create } from 'zustand';

import type { TrashProgress, TrashResult } from '@/types';

export type CleanupStatus = 'idle' | 'preview' | 'in-progress' | 'complete' | 'error';

export interface CleanupState {
  status: CleanupStatus;
  progress: TrashProgress | null;
  result: TrashResult | null;
  error: string | null;
  pendingFiles: { path: string; name: string; size: number }[];

  setPendingFiles: (files: { path: string; name: string; size: number }[]) => void;
  setPreview: () => void;
  setInProgress: () => void;
  setProgress: (progress: TrashProgress) => void;
  setComplete: (result: TrashResult) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useCleanupStore = create<CleanupState>((set) => ({
  status: 'idle',
  progress: null,
  result: null,
  error: null,
  pendingFiles: [],

  setPendingFiles: (pendingFiles) => set({ pendingFiles }),
  setPreview: () => set({ status: 'preview', progress: null, result: null, error: null }),
  setInProgress: () => set({ status: 'in-progress' }),
  setProgress: (progress) => set({ progress }),
  setComplete: (result) => set({ status: 'complete', progress: null, result }),
  setError: (error) => set({ status: 'error', error }),
  reset: () =>
    set({ status: 'idle', progress: null, result: null, error: null, pendingFiles: [] }),
}));
