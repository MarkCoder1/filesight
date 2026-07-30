'use client';

import { useCallback, useState } from 'react';

import { useIpc } from './use-ipc';
import type { OrgMoveResult, OrgPlan, OrgUndoRecord } from '@/types';

export function useOrganization() {
  const ipc = useIpc();

  const [plan, setPlan] = useState<OrgPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<OrgMoveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<OrgUndoRecord[]>([]);
  const [undoResult, setUndoResult] = useState<{ undoneCount: number; failedCount: number } | null>(null);

  const generatePlan = useCallback(
    async (files: Array<{ path: string; name: string; size: number; extension: string }>, sourceFolder: string) => {
      setIsGenerating(true);
      setError(null);
      setResult(null);
      try {
        const orgPlan = await ipc.generateOrgPlan(files, sourceFolder);
        setPlan(orgPlan);
        return orgPlan;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate organization plan';
        setError(message);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [ipc],
  );

  type MoveInput = { id: string; originalPath: string; newPath: string; fileName: string; size: number; category: string };

  const executeMoves = useCallback(
    async (operations: MoveInput[]) => {
      setIsExecuting(true);
      setError(null);
      try {
        const moveResult = await ipc.executeOrgMoves(operations);
        setResult(moveResult);
        return moveResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to execute moves';
        setError(message);
        return null;
      } finally {
        setIsExecuting(false);
      }
    },
    [ipc],
  );

  const fetchHistory = useCallback(async () => {
    try {
      const orgHistory = await ipc.getOrgHistory();
      setHistory(orgHistory);
      return orgHistory;
    } catch {
      return [];
    }
  }, [ipc]);

  const undo = useCallback(
    async (recordId: string, moves: Array<{ originalPath: string; newPath: string }>) => {
      setError(null);
      try {
        const orgUndoResult = await ipc.undoOrgMoves(recordId, moves);
        setUndoResult(orgUndoResult);
        await fetchHistory();
        return orgUndoResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to undo moves';
        setError(message);
        return null;
      }
    },
    [ipc, fetchHistory],
  );

  const reset = useCallback(() => {
    setPlan(null);
    setResult(null);
    setError(null);
    setUndoResult(null);
  }, []);

  return {
    plan,
    isGenerating,
    isExecuting,
    result,
    error,
    history,
    undoResult,
    generatePlan,
    executeMoves,
    fetchHistory,
    undo,
    reset,
  };
}
