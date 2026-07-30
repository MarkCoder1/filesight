'use client';

import { Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';

interface SelectedFilesBarProps {
  count: number;
  totalSize: number;
  onClear: () => void;
  onMoveToTrash: () => void;
  disabled?: boolean;
}

export function SelectedFilesBar({
  count,
  totalSize,
  onClear,
  onMoveToTrash,
  disabled,
}: SelectedFilesBarProps) {
  if (count === 0) return null;

  return (
    <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-lg border bg-background px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {count} file{count !== 1 ? 's' : ''} selected
        </span>
        <span className="text-xs text-muted-foreground">&middot; {formatBytes(totalSize)}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onMoveToTrash}
        disabled={disabled}
        className="gap-1.5 hover:cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
        Move to Trash
      </Button>
    </div>
  );
}
