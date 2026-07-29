'use client';

import { create } from 'zustand';

import type { CleanupHistoryRecord, ScanComparison, ScanHistoryRecord } from '@/types';

export interface HistoryState {
  scans: ScanHistoryRecord[];
  totalScans: number;
  loading: boolean;
  selectedScan: ScanHistoryRecord | null;
  comparison: ScanComparison | null;
  latestCleanup: CleanupHistoryRecord | null;
  totalRecovered: number;
  error: string | null;

  setScans: (scans: ScanHistoryRecord[], total: number) => void;
  setSelectedScan: (scan: ScanHistoryRecord | null) => void;
  setComparison: (comparison: ScanComparison | null) => void;
  setLatestCleanup: (cleanup: CleanupHistoryRecord | null) => void;
  setTotalRecovered: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  scans: [],
  totalScans: 0,
  loading: false,
  selectedScan: null,
  comparison: null,
  latestCleanup: null,
  totalRecovered: 0,
  error: null,

  setScans: (scans, total) => set({ scans, totalScans: total }),
  setSelectedScan: (selectedScan) => set({ selectedScan }),
  setComparison: (comparison) => set({ comparison }),
  setLatestCleanup: (latestCleanup) => set({ latestCleanup }),
  setTotalRecovered: (totalRecovered) => set({ totalRecovered }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetHistory: () => set({ scans: [], totalScans: 0, selectedScan: null, comparison: null, latestCleanup: null, totalRecovered: 0 }),
}));
