'use client';

import { useCallback } from 'react';

import { useHistoryStore } from '@/stores/history-store';

import { useIpc } from './use-ipc';

export function useHistory() {
  const ipc = useIpc();

  const {
    scans,
    totalScans,
    loading,
    selectedScan,
    comparison,
    latestCleanup,
    totalRecovered,
    error,
    setScans,
    setSelectedScan,
    setComparison,
    setLatestCleanup,
    setTotalRecovered,
    setLoading,
    setError,
    resetHistory: resetStore,
  } = useHistoryStore();

  const fetchScans = useCallback(
    async (limit?: number, offset?: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await ipc.getScanHistory(limit, offset);
        setScans(result.scans, result.total);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load history';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [ipc, setScans, setLoading, setError],
  );

  const fetchScanDetail = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const scan = await ipc.getScanDetail(id);
        setSelectedScan(scan);
        return scan;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load scan detail';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [ipc, setSelectedScan, setLoading, setError],
  );

  const fetchComparison = useCallback(
    async (scanId1: string, scanId2: string) => {
      setError(null);
      try {
        const result = await ipc.compareScans(scanId1, scanId2);
        setComparison(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to compare scans';
        setError(message);
        return null;
      }
    },
    [ipc, setComparison, setError],
  );

  const fetchLatestCleanup = useCallback(async () => {
    try {
      const result = await ipc.getLatestCleanup();
      setLatestCleanup(result);
      return result;
    } catch {
      return null;
    }
  }, [ipc, setLatestCleanup]);

  const resetHistory = useCallback(async () => {
    try {
      await ipc.resetHistory();
      resetStore();
    } catch {
      // no-op
    }
  }, [ipc, resetStore]);

  const fetchTotalRecovered = useCallback(async () => {
    try {
      const result = await ipc.getTotalRecovered();
      setTotalRecovered(result);
      return result;
    } catch {
      return null;
    }
  }, [ipc, setTotalRecovered]);

  return {
    scans,
    totalScans,
    loading,
    selectedScan,
    comparison,
    latestCleanup,
    totalRecovered,
    error,
    fetchScans,
    fetchScanDetail,
    fetchComparison,
    fetchLatestCleanup,
    fetchTotalRecovered,
    resetHistory,
  };
}
