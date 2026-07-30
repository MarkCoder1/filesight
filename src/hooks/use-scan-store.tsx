'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import type { ScanResult } from '@/types';

interface ScanStoreContext {
  lastResult: ScanResult | null;
  setLastResult: (result: ScanResult) => void;
  clearResult: () => void;
  removeFiles: (paths: string[]) => void;
}

const ScanStoreCtx = createContext<ScanStoreContext>({
  lastResult: null,
  setLastResult: () => {},
  clearResult: () => {},
  removeFiles: () => {},
});

export function ScanStoreProvider({ children }: { children: React.ReactNode }) {
  const [lastResult, setLastResultState] = useState<ScanResult | null>(null);

  const setLastResult = useCallback((result: ScanResult) => {
    setLastResultState(result);
  }, []);

  const clearResult = useCallback(() => {
    setLastResultState(null);
  }, []);

  const removeFiles = useCallback((paths: string[]) => {
    setLastResultState((prev) => {
      if (!prev) return prev;
      const deletedSet = new Set(paths);
      const files = prev.files.filter((f) => !deletedSet.has(f.path));
      const removedSize = prev.files
        .filter((f) => deletedSet.has(f.path))
        .reduce((s, f) => s + f.size, 0);
      return {
        ...prev,
        files,
        totalFiles: files.length,
        totalSize: prev.totalSize - removedSize,
      };
    });
  }, []);

  return (
    <ScanStoreCtx.Provider value={{ lastResult, setLastResult, clearResult, removeFiles }}>
      {children}
    </ScanStoreCtx.Provider>
  );
}

export function useScanStore() {
  return useContext(ScanStoreCtx);
}
