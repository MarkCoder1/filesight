'use client';

import { AlertTriangle } from 'lucide-react';

import { formatBytes } from '@/lib/utils';
import type { OldFilesResult } from '@/types';

interface OldFilesCardProps {
  oldFiles: OldFilesResult;
}

export function OldFilesCard({ oldFiles }: OldFilesCardProps) {
  if (oldFiles.files.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No old files found.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <span className="text-2xl font-bold">{oldFiles.olderThan6Months}</span>
          <span className="text-xs text-muted-foreground">&gt;6 months</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <span className="text-2xl font-bold">{oldFiles.olderThan1Year}</span>
          <span className="text-xs text-muted-foreground">&gt;1 year</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <span className="text-2xl font-bold">{oldFiles.olderThan2Years}</span>
          <span className="text-xs text-muted-foreground">&gt;2 years</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {oldFiles.files.slice(0, 10).map((file, i) => (
          <div
            key={`${file.path}-${i}`}
            className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)} &middot; {file.ageDays} days old
              </p>
            </div>
          </div>
        ))}
        {oldFiles.files.length > 10 && (
          <p className="text-xs text-muted-foreground">+{oldFiles.files.length - 10} more files</p>
        )}
      </div>
    </div>
  );
}
