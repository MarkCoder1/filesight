'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useDuplicateStore } from '@/stores/duplicate-store';
import type { DuplicateScanProgress } from '@/types';

import { useIpc } from './use-ipc';

export function useDuplicate() {
  const ipc = useIpc();
  const cleanupRef = useRef<(() => void)[]>([]);

  const {
    status,
    groups,
    progress,
    result,
    error,
    selectedFilePaths,
    setScanning,
    setProgress,
    setComplete,
    setError,
    reset,
    toggleFileSelection,
    selectAllExceptOne,
    clearSelection,
  } = useDuplicateStore();

  useEffect(() => {
    const fns = cleanupRef.current;
    return () => {
      fns.forEach((fn) => fn());
    };
  }, []);

  const startScan = useCallback(
    async (files: { path: string; name: string; size: number; modifiedAt: Date }[]) => {
      reset();
      setScanning();

      const unsubProgress = ipc.onDuplicateProgress((p: DuplicateScanProgress) => {
        setProgress(p);
      });
      cleanupRef.current.push(unsubProgress);

      try {
        const result = await ipc.findDuplicates(files);
        unsubProgress();
        setComplete(result);
        return result;
      } catch (err) {
        unsubProgress();
        const message = err instanceof Error ? err.message : 'Duplicate scan failed';
        setError(message);
        return null;
      }
    },
    [ipc, reset, setScanning, setProgress, setComplete, setError],
  );

  const cancel = useCallback(() => {
    ipc.cancelDuplicateScan();
    reset();
  }, [ipc, reset]);

  return {
    status,
    groups,
    progress,
    result,
    error,
    selectedFilePaths,
    startScan,
    cancel,
    reset,
    toggleFileSelection,
    selectAllExceptOne,
    clearSelection,
    isIdle: status === 'idle',
    isScanning: status === 'scanning',
    isComplete: status === 'complete',
    isError: status === 'error',
  };
}
