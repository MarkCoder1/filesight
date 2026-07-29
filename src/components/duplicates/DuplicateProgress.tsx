'use client';

import { Copy } from 'lucide-react';

interface DuplicateProgressProps {
  currentFile: string;
  processedFiles: number;
  totalFiles: number;
  percentage: number;
}

export function DuplicateProgress({
  currentFile,
  processedFiles,
  totalFiles,
  percentage,
}: DuplicateProgressProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Copy className="h-4 w-4 animate-pulse text-amber-500" />
        <p className="text-sm font-medium">Scanning for duplicates...</p>
      </div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span className="truncate max-w-[60%]">{currentFile}</span>
        <span>
          {processedFiles} / {totalFiles}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
