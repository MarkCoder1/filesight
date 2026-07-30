'use client';

import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';
import type { TrashResult } from '@/types';

interface CleanupResultProps {
  result: TrashResult;
  onDone: () => void;
  onViewReport?: () => void;
}

export function CleanupResult({ result, onDone, onViewReport }: CleanupResultProps) {
  const hasErrors = result.failureCount > 0;

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center gap-2 text-center">
        {hasErrors ? (
          <AlertCircle className="h-8 w-8 text-amber-500" />
        ) : (
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        )}
        <h3 className="text-lg font-semibold">
          Cleanup {hasErrors ? 'completed with errors' : 'complete'}
        </h3>
      </div>

      <div className="flex justify-center gap-6 text-center">
        <div>
          <p className="text-2xl font-bold">{result.successCount}</p>
          <p className="text-xs text-muted-foreground">Moved</p>
        </div>
        {result.failureCount > 0 && (
          <div>
            <p className="text-2xl font-bold text-destructive">{result.failureCount}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        )}
      </div>

      {hasErrors && (
        <div className="space-y-1.5 rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground">Errors</p>
          {result.results
            .filter((r) => !r.success)
            .slice(0, 5)
            .map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-muted-foreground">{r.error}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="flex gap-2">
        {onViewReport && (
          <Button variant="outline" size="sm" onClick={onViewReport}>
            View Report
          </Button>
        )}
        <Button variant="default" size="sm" onClick={onDone}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
