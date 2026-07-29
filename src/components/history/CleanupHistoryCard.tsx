'use client';

import { Trash2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { formatBytes, formatRelativeDate } from '@/lib/utils';
import type { CleanupHistoryRecord } from '@/types';

interface CleanupHistoryCardProps {
  cleanup: CleanupHistoryRecord;
}

export function CleanupHistoryCard({ cleanup }: CleanupHistoryCardProps) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{formatRelativeDate(new Date(cleanup.date))}</p>
            <p className="text-xs text-muted-foreground">
              {cleanup.filesMoved} file{cleanup.filesMoved !== 1 ? 's' : ''} moved &middot;{' '}
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatBytes(cleanup.spaceRecovered)} recovered
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
