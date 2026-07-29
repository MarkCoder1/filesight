'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ScanProgress, ScanResult } from '@/types';

import { useIpc } from './use-ipc';

export type ScanState =
  | { status: 'idle' }
  | { status: 'counting' }
  | { status: 'scanning'; progress: ScanProgress }
  | { status: 'complete'; result: ScanResult }
  | { status: 'error'; message: string };

export function useScan() {
  const ipc = useIpc();
  const [state, setState] = useState<ScanState>({ status: 'idle' });
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const fns = cleanupRef.current;
    return () => {
      fns.forEach((fn) => fn());
    };
  }, []);

  const scan = useCallback(
    async (dirPath: string): Promise<ScanResult | null> => {
      setState({ status: 'counting' });

      const cleanupProgress = ipc.onScanProgress((progress: ScanProgress) => {
        setState({ status: 'scanning', progress });
      });
      cleanupRef.current.push(cleanupProgress);

      try {
        const result = await ipc.startScan(dirPath);
        cleanupProgress();
        setState({ status: 'complete', result });
        return result;
      } catch (err) {
        cleanupProgress();
        const message = err instanceof Error ? err.message : 'Scan failed';
        setState({ status: 'error', message });
        return null;
      }
    },
    [ipc],
  );

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return { state, scan, reset };
}
