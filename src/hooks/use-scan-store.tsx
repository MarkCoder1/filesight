'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import type { ScanResult } from '@/types';

interface ScanStoreContext {
  lastResult: ScanResult | null;
  setLastResult: (result: ScanResult) => void;
  clearResult: () => void;
}

const ScanStoreCtx = createContext<ScanStoreContext>({
  lastResult: null,
  setLastResult: () => {},
  clearResult: () => {},
});

export function ScanStoreProvider({ children }: { children: React.ReactNode }) {
  const [lastResult, setLastResultState] = useState<ScanResult | null>(null);

  const setLastResult = useCallback((result: ScanResult) => {
    setLastResultState(result);
  }, []);

  const clearResult = useCallback(() => {
    setLastResultState(null);
  }, []);

  return (
    <ScanStoreCtx.Provider value={{ lastResult, setLastResult, clearResult }}>
      {children}
    </ScanStoreCtx.Provider>
  );
}

export function useScanStore() {
  return useContext(ScanStoreCtx);
}
