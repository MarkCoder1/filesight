'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatBytes } from '@/lib/utils';
import type { DuplicateGroup } from '@/types';

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

  return (
    <div className="rounded-lg border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
          <CollapsibleTrigger asChild>
            <button className="flex flex-1 items-center gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {group.files.length}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file0.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.files.length} copies &middot;{' '}
                  {formatBytes(group.files[0].size)} each &middot;
                  <span className="ml-1 font-medium text-destructive">
                    {formatBytes(group.wastedSpace)} wasted
                  </span>
                </p>
              </div>
              <svg
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
              <p className="text-xs font-medium text-muted-foreground">
                {group.files.length} copies &middot; Total: {formatBytes(group.totalSize)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onSelectAllExceptOne(group)}
                >
                  Select all except one
                </Button>
              </div>
            </div>
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
