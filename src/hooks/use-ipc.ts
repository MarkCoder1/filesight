'use client';

import { useCallback, useMemo } from 'react';

import { getElectronAPI } from '@/lib/ipc';
import type { DuplicateScanProgress, ScanProgress, TrashProgress } from '@/types';

export function useIpc() {
  const api = getElectronAPI();

  const startScan = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.startScan(path);
    },
    [api],
  );

  const onScanProgress = useCallback(
    (callback: (progress: ScanProgress) => void) => {
      if (!api) return () => {};
      return api.onScanProgress(callback);
    },
    [api],
  );

  const onScanComplete = useCallback(
    (callback: (result: { path: string; totalFiles: number; totalSize: number }) => void) => {
      if (!api) return () => {};
      return api.onScanComplete(callback);
    },
    [api],
  );

  const trashPreview = useCallback(
    async (files: { path: string; name: string; size: number }[]) => {
      if (!api) throw new Error('Electron API not available');
      return api.trashPreview(files);
    },
    [api],
  );

  const moveToTrash = useCallback(
    async (files: { path: string; name: string; size: number }[]) => {
      if (!api) throw new Error('Electron API not available');
      return api.moveToTrash(files);
    },
    [api],
  );

  const onTrashProgress = useCallback(
    (callback: (progress: TrashProgress) => void) => {
      if (!api) return () => {};
      return api.onTrashProgress(callback);
    },
    [api],
  );

  const revealInFinder = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.revealInFinder(path);
    },
    [api],
  );

  const openFile = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.openFile(path);
    },
    [api],
  );

  const getHomeDirectory = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.getHomeDirectory();
  }, [api]);

  const getAppVersion = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.getAppVersion();
  }, [api]);

  const runAnalysis = useCallback(
    async (files: import('@/types').FileEntry[]) => {
      if (!api) throw new Error('Electron API not available');
      return api.runAnalysis(files);
    },
    [api],
  );

  const findDuplicates = useCallback(
    async (files: { path: string; name: string; size: number; modifiedAt: Date }[]) => {
      if (!api) throw new Error('Electron API not available');
      return api.findDuplicates(files);
    },
    [api],
  );

  const cancelDuplicateScan = useCallback(() => {
    api?.cancelDuplicateScan();
  }, [api]);

  const deleteDuplicates = useCallback(
    async (files: { path: string; name: string }[], totalSize: number) => {
      if (!api) throw new Error('Electron API not available');
      return api.deleteDuplicates(files, totalSize);
    },
    [api],
  );

  const onDuplicateDeleteProgress = useCallback(
    (callback: (progress: { current: number; total: number; currentFile: string }) => void) => {
      if (!api) return () => {};
      return api.onDuplicateDeleteProgress(callback);
    },
    [api],
  );

  const recommendDuplicates = useCallback(
    async (
      files: Array<{
        path: string;
        name: string;
        size: number;
        modifiedAt: Date;
        resolution?: { width: number; height: number };
        matchType?: string;
      }>,
    ) => {
      if (!api) return null;
      return api.recommendDuplicates(files);
    },
    [api],
  );

  const onDuplicateProgress = useCallback(
    (callback: (progress: DuplicateScanProgress) => void) => {
      if (!api) return () => {};
      return api.onDuplicateProgress(callback);
    },
    [api],
  );

  const getScanHistory = useCallback(
    async (limit?: number, offset?: number) => {
      if (!api) throw new Error('Electron API not available');
      return api.getScanHistory(limit, offset);
    },
    [api],
  );

  const getScanDetail = useCallback(
    async (id: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.getScanDetail(id);
    },
    [api],
  );

  const getLatestScan = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.getLatestScan();
  }, [api]);

  const getLatestCleanup = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.getLatestCleanup();
  }, [api]);

  const getTotalRecovered = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.getTotalRecovered();
  }, [api]);

  const getSettings = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.getSettings();
  }, [api]);

  const updateSettings = useCallback(
    async (settings: Partial<import('@/types').UserSettings>) => {
      if (!api) throw new Error('Electron API not available');
      return api.updateSettings(settings);
    },
    [api],
  );

  const resetSettings = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.resetSettings();
  }, [api]);

  const selectFolder = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.selectFolder();
  }, [api]);

  const resetHistory = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.resetHistory();
  }, [api]);

  const readTextFile = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.readTextFile(path);
    },
    [api],
  );

  const readImageFile = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.readImageFile(path);
    },
    [api],
  );

  const readFileBase64 = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.readFileBase64(path);
    },
    [api],
  );

  const fileExists = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.fileExists(path);
    },
    [api],
  );

  const openInFolder = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.openInFolder(path);
    },
    [api],
  );

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.copyToClipboard(text);
    },
    [api],
  );

  const fileStat = useCallback(
    async (path: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.fileStat(path);
    },
    [api],
  );

  const generateOrgPlan = useCallback(
    async (
      files: Array<{ path: string; name: string; size: number; extension: string }>,
      sourceFolder: string,
    ) => {
      if (!api) throw new Error('Electron API not available');
      return api.generateOrgPlan(files, sourceFolder);
    },
    [api],
  );

  const executeOrgMoves = useCallback(
    async (
      operations: Array<{
        id: string;
        originalPath: string;
        newPath: string;
        fileName: string;
        size: number;
        category: string;
      }>,
    ) => {
      if (!api) throw new Error('Electron API not available');
      return api.executeOrgMoves(operations);
    },
    [api],
  );

  const getOrgHistory = useCallback(async () => {
    if (!api) throw new Error('Electron API not available');
    return api.getOrgHistory();
  }, [api]);

  const undoOrgMoves = useCallback(
    async (recordId: string, moves: Array<{ originalPath: string; newPath: string }>) => {
      if (!api) throw new Error('Electron API not available');
      return api.undoOrgMoves(recordId, moves);
    },
    [api],
  );

  const compareScans = useCallback(
    async (scanId1: string, scanId2: string) => {
      if (!api) throw new Error('Electron API not available');
      return api.compareScans(scanId1, scanId2);
    },
    [api],
  );

  return useMemo(
    () => ({
      startScan,
      onScanProgress,
      onScanComplete,
      runAnalysis,
      findDuplicates,
      cancelDuplicateScan,
      onDuplicateProgress,
      getScanHistory,
      getScanDetail,
      getLatestScan,
      getLatestCleanup,
      getTotalRecovered,
      compareScans,
      trashPreview,
      moveToTrash,
      onTrashProgress,
      revealInFinder,
      openFile,
      getHomeDirectory,
      getAppVersion,
      getSettings,
      updateSettings,
      resetSettings,
      selectFolder,
      resetHistory,
      readTextFile,
      readImageFile,
      readFileBase64,
      fileExists,
      openInFolder,
      copyToClipboard,
      fileStat,
      generateOrgPlan,
      executeOrgMoves,
      getOrgHistory,
      undoOrgMoves,
      deleteDuplicates,
      onDuplicateDeleteProgress,
      recommendDuplicates,
      isAvailable: !!api,
    }),
    [
      startScan,
      onScanProgress,
      onScanComplete,
      runAnalysis,
      findDuplicates,
      cancelDuplicateScan,
      deleteDuplicates,
      onDuplicateDeleteProgress,
      recommendDuplicates,
      onDuplicateProgress,
      getScanHistory,
      getScanDetail,
      getLatestScan,
      getLatestCleanup,
      getTotalRecovered,
      compareScans,
      trashPreview,
      moveToTrash,
      onTrashProgress,
      revealInFinder,
      openFile,
      getHomeDirectory,
      getAppVersion,
      getSettings,
      updateSettings,
      resetSettings,
      selectFolder,
      resetHistory,
      readTextFile,
      readImageFile,
      readFileBase64,
      fileExists,
      openInFolder,
      copyToClipboard,
      fileStat,
      generateOrgPlan,
      executeOrgMoves,
      getOrgHistory,
      undoOrgMoves,
      api,
    ],
  );
}
