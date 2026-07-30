'use client';

import { useCallback, useEffect } from 'react';

import { DuplicateGroupCard } from '@/components/duplicates/DuplicateGroup';
import { DuplicateSummary } from '@/components/duplicates/DuplicateSummary';
import { useCleanup } from '@/hooks/use-cleanup';
import { useDuplicate } from '@/hooks/use-duplicate';
import { useIpc } from '@/hooks/use-ipc';
import { useScanStore } from '@/hooks/use-scan-store';
import { formatBytes } from '@/lib/utils';

import { DuplicateProgress } from './DuplicateProgress';

interface DuplicateCardProps {
  onGoHome?: () => void;
}

export function DuplicateCard({ onGoHome }: DuplicateCardProps) {
  const { lastResult } = useScanStore();

  const duplicate = useDuplicate();
  const insightsCleanup = useCleanup();
  const ipc = useIpc();

  useEffect(() => {
    if (lastResult && duplicate.isIdle && !duplicate.result) {
      duplicate.startScan(lastResult.files);
    }
  }, [lastResult, duplicate]);

  const handleReveal = useCallback(
    (filePath: string) => {
      ipc.revealInFinder(filePath);
    },
    [ipc],
  );

  const handleTrash = useCallback(
    (files: { path: string; name: string; size: number }[]) => {
      insightsCleanup.showPreview(files);
    },
    [insightsCleanup],
  );

  const handleCleanupDone = useCallback(() => {
    insightsCleanup.reset();
  }, [insightsCleanup]);

  return (
    <div className="space-y-4">
      {duplicate.isScanning && duplicate.progress && (
        <DuplicateProgress
          currentFile={duplicate.progress.currentFile}
          processedFiles={duplicate.progress.processedFiles}
          totalFiles={duplicate.progress.totalFiles}
          percentage={duplicate.progress.percentage}
          stage={duplicate.progress.stage}
        />
      )}

      {duplicate.isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {duplicate.error}
          <button onClick={duplicate.reset} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {duplicate.isComplete && duplicate.result && (
        <DuplicateSummary
          groupCount={duplicate.result.duplicateGroups.length}
          totalDuplicates={duplicate.result.totalDuplicates}
          wastedSpace={duplicate.result.wastedSpace}
          exactCount={duplicate.result.duplicateGroups.filter((g) => g.confidence === 'exact' || !g.confidence).length}
          strongCount={duplicate.result.duplicateGroups.filter((g) => g.confidence === 'strong').length}
          similarCount={duplicate.result.duplicateGroups.filter((g) => g.confidence === 'similar').length}
        />
      )}

      {duplicate.isIdle && !lastResult && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No scan data available.{' '}
            {onGoHome && (
              <button onClick={onGoHome} className="underline">
                Scan a folder first.
              </button>
            )}
          </p>
        </div>
      )}

      {duplicate.isComplete && duplicate.result && duplicate.result.duplicateGroups.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            {duplicate.result.duplicateGroups.length} group{duplicate.result.duplicateGroups.length !== 1 ? 's' : ''} &middot;{' '}
            {formatBytes(duplicate.result.wastedSpace)} wasted
          </p>
          {duplicate.result.duplicateGroups.map((group) => (
            <DuplicateGroupCard
              key={group.id}
              group={group}
              selectedFilePaths={duplicate.selectedFilePaths}
              onToggle={duplicate.toggleFileSelection}
              onReveal={handleReveal}
              onSelectAllExceptOne={duplicate.selectAllExceptOne}
              trashControl={{ onTrash: handleTrash }}
            />
          ))}
        </div>
      )}

      {insightsCleanup.isPreview && (
        <div className="rounded-lg border bg-background p-4">
          <p className="mb-2 text-sm font-medium">
            Move {insightsCleanup.pendingFiles.length} file{insightsCleanup.pendingFiles.length !== 1 ? 's' : ''} to Trash?
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Total: {formatBytes(
              insightsCleanup.pendingFiles.reduce((s, f) => s + f.size, 0),
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={insightsCleanup.execute}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 hover:cursor-pointer"
            >
              Move to Trash
            </button>
            <button
              onClick={insightsCleanup.reset}
              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted hover:cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {insightsCleanup.isInProgress && insightsCleanup.progress && (
        <div className="rounded-lg border bg-background p-4">
          <div className="mb-1 flex justify-between text-xs">
            <span>{insightsCleanup.progress.currentFile}</span>
            <span>
              {insightsCleanup.progress.current}/{insightsCleanup.progress.total}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-destructive transition-all duration-300"
              style={{
                width: `${(insightsCleanup.progress.current / insightsCleanup.progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {insightsCleanup.isComplete && insightsCleanup.result && (
        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Successfully moved {insightsCleanup.result.successCount} file{insightsCleanup.result.successCount !== 1 ? 's' : ''} to Trash
          </p>
          {insightsCleanup.result.failureCount > 0 && (
            <p className="mt-1 text-xs text-destructive">
              {insightsCleanup.result.failureCount} file{insightsCleanup.result.failureCount !== 1 ? 's' : ''} could not be moved
            </p>
          )}
          <button onClick={handleCleanupDone} className="mt-2 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {insightsCleanup.isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {insightsCleanup.error}
          <button onClick={insightsCleanup.reset} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
