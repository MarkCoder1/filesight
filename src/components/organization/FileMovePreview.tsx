'use client';

import { ChevronRight, File } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatBytes } from '@/lib/utils';
import type { OrgCategoryInfo } from '@/types';

interface FileMovePreviewProps {
  category: OrgCategoryInfo;
}

export function FileMovePreview({ category }: FileMovePreviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {category.fileCount} file{category.fileCount !== 1 ? 's' : ''} &middot;{' '}
          {formatBytes(category.totalSize)}
        </p>
        <p className="truncate text-xs text-muted-foreground">&rarr; {category.suggestedPath}</p>
      </div>
      <ScrollArea className="max-h-64">
        <div className="space-y-1">
          {category.files.slice(0, 100).map((file) => (
            <div
              key={file.path}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/50"
            >
              <File className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatBytes(file.size)}
              </span>
            </div>
          ))}
          {category.files.length > 100 && (
            <p className="px-2 text-xs text-muted-foreground">
              +{category.files.length - 100} more files
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
