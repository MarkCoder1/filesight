'use client';

import { FileIcon, getFileIconColor } from '@/lib/file-icons';
import { formatBytes } from '@/lib/utils';
import type { FileEntry } from '@/types';

interface LargestFilesProps {
  files: FileEntry[];
}

export function LargestFiles({ files }: LargestFilesProps) {
  const sorted = [...files].sort((a, b) => b.size - a.size);

  return (
    <div className="space-y-3">
      {sorted.slice(0, 5).map((file) => (
        <div
          key={file.path}
          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${getFileIconColor(file.category)}20` }}
          >
            <FileIcon
              category={file.category}
              className="h-4 w-4"
              style={{ color: getFileIconColor(file.category) }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)} &middot; {file.category}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
