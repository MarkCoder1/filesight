'use client';

import { CheckCircle, ExternalLink, Star, Trash2 } from 'lucide-react';

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

function getMatchTypeLabel(matchType?: string): string {
  switch (matchType) {
    case 'hash-exact': return 'Exact';
    case 'filename-similar': return 'Filename';
    case 'perceptual': return 'Similar';
    case 'document-similar': return 'Document';
    case 'video-similar': return 'Video';
    default: return '';
  }
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
        const isRecommended = file.isRecommended;
        const matchLabel = getMatchTypeLabel(file.matchType);
        return (
          <div
            key={file.path}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
              isSelected ? 'border-primary/50 bg-primary/5' : ''
            } ${isRecommended ? 'border-emerald-200 bg-emerald-500/5 dark:border-emerald-800' : ''}`}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(file.path)}
              aria-label={`Select ${file.name}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">
                  {file.name}
                </p>
                {isRecommended && (
                  <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Star className="h-3 w-3" />
                    Keep
                  </span>
                )}
                {file.similarity !== undefined && file.similarity < 1 && (
                  <span className="shrink-0 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                    {Math.round(file.similarity * 100)}%
                  </span>
                )}
                {matchLabel && (
                  <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {matchLabel}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{file.path}</p>
              <div className="mt-0.5 flex gap-3 text-xs text-muted-foreground">
                <span>{formatBytes(file.size)}</span>
                <span>{formatDate(file.modifiedAt)}</span>
                {file.resolution && (
                  <span>{file.resolution.width}x{file.resolution.height}</span>
                )}
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
