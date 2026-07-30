'use client';

import { useCallback } from 'react';

import { useInsightStore } from '@/stores/insight-store';
import type { FileEntry } from '@/types';

import { useIpc } from './use-ipc';

export function useAnalysis() {
  const { runAnalysis: ipcRunAnalysis } = useIpc();
  const { analysis, isAnalyzing, setAnalysis, clearAnalysis, setIsAnalyzing } = useInsightStore();

  const runAnalysis = useCallback(
    async (files: FileEntry[]) => {
      setIsAnalyzing(true);
      try {
        const result = await ipcRunAnalysis(files);
        setAnalysis(result);
        return result;
      } catch {
        setIsAnalyzing(false);
        return null;
      }
    },
    [ipcRunAnalysis, setAnalysis, setIsAnalyzing],
  );

  return { analysis, isAnalyzing, runAnalysis, clearAnalysis };
}
