'use client';

import { formatBytes, formatDate } from '@/lib/utils';
import type { FileEntry } from '@/types';

interface FileInfoProps {
  file: FileEntry;
}

export function FileInfo({ file }: FileInfoProps) {
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Filename</span>
        <span className="max-w-[60%] truncate text-right font-medium">{file.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Type</span>
        <span className="font-medium">{file.extension ? file.extension.toUpperCase() : 'N/A'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Size</span>
        <span className="font-medium">{formatBytes(file.size)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Modified</span>
        <span className="font-medium">{formatDate(file.modifiedAt)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Created</span>
        <span className="font-medium">{formatDate(file.createdAt)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Path</span>
        <span className="max-w-[60%] truncate text-right text-xs font-mono text-muted-foreground">
          {file.path}
        </span>
      </div>
    </div>
  );
}
