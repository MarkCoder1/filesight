'use client';

import { FileSearch, Loader2 } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import type { ScanProgress as ScanProgressType } from '@/types';

interface ScanProgressProps {
  progress: ScanProgressType;
}

export function ScanProgress({ progress }: ScanProgressProps) {
  const isCounting = progress.phase === 'counting';

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {isCounting ? 'Analyzing folder...' : 'Scanning files...'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isCounting
              ? 'Counting files and gathering metadata...'
              : `${progress.scannedFiles.toLocaleString()} / ${progress.totalFiles.toLocaleString()} files`}
          </p>
        </div>
      </div>

      {!isCounting && progress.totalFiles > 0 && (
        <div className="space-y-3">
          <Progress value={progress.percentage} className="h-2" />
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <FileSearch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-muted-foreground">
                {progress.currentFile ?? 'Processing...'}
              </p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {progress.percentage}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Finding storage usage and file details...
          </p>
        </div>
      )}
    </div>
  );
}
