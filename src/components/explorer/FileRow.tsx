'use client';

import { memo } from 'react';
import { FileIcon, getFileIconColor } from '@/lib/file-icons';
import { formatRelativeDate } from '@/lib/utils';
import type { FileEntry } from '@/types';

import { CategoryBadge } from './CategoryBadge';
import { FileSize } from './FileSize';

interface FileRowProps {
  file: FileEntry;
  selected: boolean;
  onToggleSelect: () => void;
}

export const FileRow = memo(function FileRow({ file, selected, onToggleSelect }: FileRowProps) {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${getFileIconColor(file.category)}18` }}
          >
            <FileIcon
              category={file.category}
              className="h-4 w-4"
              style={{ color: getFileIconColor(file.category) }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="truncate text-xs text-muted-foreground">{file.extension || '(no ext)'}</p>
          </div>
        </div>
      </td>
      <td className="p-2">
        <CategoryBadge category={file.category} />
      </td>
      <td className="p-2 text-right">
        <FileSize bytes={file.size} />
      </td>
      <td className="p-2 text-nowrap text-xs text-muted-foreground">
        {formatRelativeDate(file.createdAt)}
      </td>
      <td className="p-2 text-nowrap text-xs text-muted-foreground">
        {formatRelativeDate(file.modifiedAt)}
      </td>
    </tr>
  );
}, (prev, next) => prev.file.id === next.file.id && prev.selected === next.selected);
