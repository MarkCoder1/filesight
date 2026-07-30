'use client';

import { FileIcon, getFileIconColor } from '@/lib/file-icons';
import { formatBytes } from '@/lib/utils';
import { CleanupButton } from '@/components/cleanup/CleanupButton';
import type { FileCategory } from '@/types';

interface LargestFileItem {
  name: string;
  path: string;
  size: number;
  category: FileCategory;
}

interface LargestFilesCardProps {
  files: LargestFileItem[];
  onTrash?: (files: { path: string; name: string; size: number }[]) => void;
}

export function LargestFilesCard({ files, onTrash }: LargestFilesCardProps) {
  if (files.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No files found.</p>;
  }

  return (
    <div className="space-y-2">
      {files.map((file, i) => (
        <div
          key={`${file.name}-${i}`}
          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
          <span className="w-5 text-center text-xs font-medium text-muted-foreground">{i + 1}</span>
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
            <p className="text-xs text-muted-foreground capitalize">{file.category}</p>
          </div>
          <span className="shrink-0 text-sm tabular-nums font-medium">
            {formatBytes(file.size)}
          </span>
          {onTrash && (
            <CleanupButton
              onClick={() => onTrash([{ path: file.path, name: file.name, size: file.size }])}
            />
          )}
        </div>
      ))}
    </div>
  );
}
