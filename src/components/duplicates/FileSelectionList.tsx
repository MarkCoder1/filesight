'use client';

import { ExternalLink, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatBytes, formatDate } from '@/lib/utils';
import type { DuplicateFileInfo } from '@/types';

interface FileSelectionListProps {
  files: DuplicateFileInfo[];
  selectedFilePaths: Set<string>;
  onToggle: (path: string) => void;
  onReveal: (path: string) => void;
  canTrash?: boolean;
  onTrash?: (files: { path: string; name: string; size: number }[]) => void;
}

export function FileSelectionList({
  files,
  selectedFilePaths,
  onToggle,
  onReveal,
  canTrash,
  onTrash,
}: FileSelectionListProps) {
  const selectedCount = files.filter((f) => selectedFilePaths.has(f.path)).length;

  return (
    <div className="space-y-1">
      {files.map((file) => {
        const isSelected = selectedFilePaths.has(file.path);
        return (
          <div
            key={file.path}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
              isSelected ? 'border-primary/50 bg-primary/5' : ''
            }`}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(file.path)}
              aria-label={`Select ${file.name}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{file.name}</p>
              </div>
              <p className="truncate text-xs text-muted-foreground">{file.path}</p>
              <div className="mt-0.5 flex gap-3 text-xs text-muted-foreground">
                <span>{formatBytes(file.size)}</span>
                <span>{formatDate(file.modifiedAt)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => onReveal(file.path)}
              title="Show in folder"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
      {selectedCount > 0 && canTrash && onTrash && (
        <div className="flex justify-end pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              const selected = files
                .filter((f) => selectedFilePaths.has(f.path))
                .map((f) => ({ path: f.path, name: f.name, size: f.size }));
              onTrash(selected);
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Move {selectedCount} Selected to Trash
          </Button>
        </div>
      )}
    </div>
  );
}
