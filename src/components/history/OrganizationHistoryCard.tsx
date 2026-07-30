'use client';

import { FolderTree, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatBytes, formatRelativeDate } from '@/lib/utils';
import type { OrgUndoRecord } from '@/types';

interface OrganizationHistoryCardProps {
  record: OrgUndoRecord;
  onUndo: (record: OrgUndoRecord) => void;
}

export function OrganizationHistoryCard({ record, onUndo }: OrganizationHistoryCardProps) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
            <FolderTree className="h-4 w-4 text-blue-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{record.label}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeDate(new Date(record.date))} &middot; {record.totalFiles} file
              {record.totalFiles !== 1 ? 's' : ''} &middot; {formatBytes(record.totalSize)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 shrink-0 text-xs"
            onClick={() => onUndo(record)}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Undo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
