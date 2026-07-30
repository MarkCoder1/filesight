'use client';

import { CheckCircle, Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatBytes } from '@/lib/utils';
import type { ConfidenceLevel, DuplicateGroup } from '@/types';

import { FileSelectionList } from './FileSelectionList';

interface DuplicateGroupProps {
  group: DuplicateGroup;
  selectedFilePaths: Set<string>;
  onToggle: (path: string) => void;
  onReveal: (path: string) => void;
  onSelectAllExceptOne: (group: DuplicateGroup) => void;
  trashControl?: {
    onTrash: (files: { path: string; name: string; size: number }[]) => void;
  };
}

const matchLabels: Record<string, { bg: string; text: string; label: string }> = {
  'hash-exact': {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    label: 'Exact',
  },
  'filename-similar': {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Filename',
  },
  perceptual: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Similar Image',
  },
  'document-similar': {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    label: 'Similar Doc',
  },
  'video-similar': {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    label: 'Similar Video',
  },
};

export function DuplicateGroupCard({
  group,
  selectedFilePaths,
  onToggle,
  onReveal,
  onSelectAllExceptOne,
  trashControl,
}: DuplicateGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const file0 = group.files[0];
  const allSelected = group.files.every((f) => selectedFilePaths.has(f.path));
  const matchType = group.matchType || 'hash-exact';
  const colors = matchLabels[matchType] || matchLabels['hash-exact'];

  const recommendedFile = group.files.find((f) => f.isRecommended) || file0;

  return (
    <div className="rounded-lg border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
          <CollapsibleTrigger asChild>
            <button className="flex flex-1 items-center gap-3 text-left">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}>
                <span className={`text-xs font-bold ${colors.text}`}>{group.files.length}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{file0.name}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}
                  >
                    {colors.label}
                  </span>
                  {recommendedFile.name !== file0.name && isOpen && (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                      <Star className="h-3 w-3" />
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {group.files.length} copy{group.files.length !== 1 ? 'ies' : 'y'} &middot;{' '}
                  {formatBytes(group.totalSize)} total &middot;
                  <span className="ml-1 font-medium text-destructive">
                    {formatBytes(group.wastedSpace)} wasted
                  </span>
                </p>
              </div>
              <svg
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </CollapsibleTrigger>
          {!isOpen && (
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => {
                if (allSelected) {
                  group.files.forEach((f) => onToggle(f.path));
                } else {
                  onSelectAllExceptOne(group);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select duplicates"
            />
          )}
        </div>
        <CollapsibleContent>
          <div className="border-t px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {matchType === 'hash-exact' && 'SHA-256 exact match'}
                  {matchType === 'filename-similar' && 'Filename + size match'}
                  {matchType === 'perceptual' && 'Perceptual image match'}
                  {matchType === 'document-similar' && 'Document text similarity'}
                  {matchType === 'video-similar' && 'Video metadata similarity'}
                </span>
                <span>&middot;</span>
                <span>{group.files.length} copies</span>
                <span>&middot;</span>
                <span>Total: {formatBytes(group.totalSize)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onSelectAllExceptOne(group)}
                >
                  Select all except recommended
                </Button>
              </div>
            </div>

            {recommendedFile && (
              <div className="mb-3 flex items-center gap-2 rounded-md bg-emerald-500/5 px-3 py-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Recommended to keep
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{recommendedFile.name}</p>
                </div>
              </div>
            )}

            <FileSelectionList
              files={group.files}
              selectedFilePaths={selectedFilePaths}
              onToggle={onToggle}
              onReveal={onReveal}
              canTrash
              onTrash={trashControl?.onTrash}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
