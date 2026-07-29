'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useCleanupStore } from '@/stores/cleanup-store';
import type { TrashProgress } from '@/types';

import { useIpc } from './use-ipc';

export function useCleanup() {
  const ipc = useIpc();
  const cleanupRef = useRef<(() => void)[]>([]);

  const {
    status,
    progress,
    result,
    error,
    pendingFiles,
    setPendingFiles,
    setPreview,
    setInProgress,
    setProgress,
    setComplete,
    setError,
    reset,
  } = useCleanupStore();

  useEffect(() => {
    const fns = cleanupRef.current;
    return () => {
      fns.forEach((fn) => fn());
    };
  }, []);

  const showPreview = useCallback(
    (files: { path: string; name: string; size: number }[]) => {
      setPendingFiles(files);
      setPreview();
    },
    [setPendingFiles, setPreview],
  );

  const execute = useCallback(async () => {
    if (pendingFiles.length === 0) return;

    setInProgress();

    const cleanupProgress = ipc.onTrashProgress((p: TrashProgress) => {
      setProgress(p);
    });
    cleanupRef.current.push(cleanupProgress);

    try {
      const result = await ipc.moveToTrash(pendingFiles);
      cleanupProgress();
      setComplete(result);
    } catch (err) {
      cleanupProgress();
      const message = err instanceof Error ? err.message : 'Cleanup failed';
      setError(message);
    }
  }, [ipc, pendingFiles, setInProgress, setProgress, setComplete, setError]);

  const cleanup = useCallback(
    async (files: { path: string; name: string; size: number }[]) => {
      setPendingFiles(files);
      setPreview();
    },
    [setPendingFiles, setPreview],
  );

  return {
    status,
    progress,
    result,
    error,
    pendingFiles,
    showPreview,
    execute,
    cleanup,
    reset,
    isIdle: status === 'idle',
    isPreview: status === 'preview',
    isInProgress: status === 'in-progress',
    isComplete: status === 'complete',
    isError: status === 'error',
  };
}
