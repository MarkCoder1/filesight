'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatBytes } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: { name: string; size: number }[];
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function ConfirmDialog({ open, onOpenChange, files, onConfirm, isProcessing }: Props) {
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Move Files To Trash?
          </DialogTitle>
          <DialogDescription>
            {files.length} file{files.length !== 1 ? 's' : ''} selected &middot;{' '}
            {formatBytes(totalSize)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p>Files will be moved to your system Trash. You can restore them later.</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Files ({files.length})</p>
          <ScrollArea className="max-h-48">
            <div className="space-y-1">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isProcessing}
            className="gap-1.5 hover:cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            {isProcessing ? 'Moving...' : 'Move to Trash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
