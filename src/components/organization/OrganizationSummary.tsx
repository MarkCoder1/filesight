'use client';

import { AlertCircle, CheckCircle, SkipForward } from 'lucide-react';

import { formatBytes } from '@/lib/utils';
import type { OrgMoveResult } from '@/types';

interface OrganizationSummaryProps {
  result: OrgMoveResult;
  onDone: () => void;
}

export function OrganizationSummary({ result, onDone }: OrganizationSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            Organization complete
          </p>
          <p className="text-sm text-muted-foreground">{formatBytes(result.totalSize)} organized</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="tabular-nums font-medium">{result.successCount}</span>
          </div>
          {result.conflictCount > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="tabular-nums font-medium">{result.conflictCount}</span>
            </div>
          )}
          {result.skipCount > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <SkipForward className="h-4 w-4 text-muted-foreground" />
              <span className="tabular-nums font-medium">{result.skipCount}</span>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {result.successCount}
          </p>
          <p className="text-xs text-muted-foreground">Moved</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {result.conflictCount}
          </p>
          <p className="text-xs text-muted-foreground">Renamed</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-lg font-bold text-muted-foreground">{result.skipCount}</p>
          <p className="text-xs text-muted-foreground">Skipped</p>
        </div>
      </div>
    </div>
  );
}
