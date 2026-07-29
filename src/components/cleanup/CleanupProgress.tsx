'use client';

import { Loader2 } from 'lucide-react';

import { formatBytes } from '@/lib/utils';

interface CleanupProgressProps {
  current: number;
  total: number;
  currentFile: string;
}

export function CleanupProgress({ current, total, currentFile }: CleanupProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-3 py-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium">Moving files to Trash...</p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {current} of {total} files
        </span>
        <span>{percentage}%</span>
      </div>

      <p className="truncate text-xs text-muted-foreground">Current: {currentFile}</p>
    </div>
  );
}
