'use client';

import { FolderSearch, Inbox } from 'lucide-react';

interface EmptyResultsProps {
  type: 'no-data' | 'no-results';
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyResults({ type, onAction, actionLabel }: EmptyResultsProps) {
  if (type === 'no-data') {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-sm font-semibold">No scan data</h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          Scan your Downloads folder to start exploring files.
        </p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FolderSearch className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">No files found</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Try changing your filters or search query.
      </p>
    </div>
  );
}
