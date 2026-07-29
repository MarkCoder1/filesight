'use client';

import { History } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { formatBytes, formatRelativeDate } from '@/lib/utils';
import type { ScanHistoryRecord } from '@/types';

interface ScanHistoryCardProps {
  scan: ScanHistoryRecord;
  previousScan?: ScanHistoryRecord | null;
  onClick?: () => void;
}

export function ScanHistoryCard({ scan, previousScan, onClick }: ScanHistoryCardProps) {
  const sizeDiff = previousScan ? scan.totalSize - previousScan.totalSize : 0;
  const fileDiff = previousScan ? scan.totalFiles - previousScan.totalFiles : 0;

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${onClick ? '' : ''}`}
      onClick={onClick}
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{formatRelativeDate(new Date(scan.date))}</p>
            <p className="text-xs text-muted-foreground">{new Date(scan.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span>
                Storage:{' '}
                <span className="font-medium">{formatBytes(scan.totalSize)}</span>
              </span>
              <span>
                Files:{' '}
                <span className="font-medium">{scan.totalFiles.toLocaleString()}</span>
              </span>
            </div>
            {previousScan && (
              <div className="mt-1.5 text-xs">
                <span
                  className={
                    sizeDiff <= 0
                      ? 'font-medium text-green-600 dark:text-green-400'
                      : 'font-medium text-destructive'
                  }
                >
                  {sizeDiff <= 0 ? '↓' : '↑'} {formatBytes(Math.abs(sizeDiff))}{' '}
                  {sizeDiff <= 0 ? 'recovered' : 'added'}
                </span>
                <span className="mx-1.5 text-muted-foreground">&middot;</span>
                <span
                  className={
                    fileDiff <= 0
                      ? 'font-medium text-green-600 dark:text-green-400'
                      : 'font-medium text-destructive'
                  }
                >
                  {fileDiff <= 0 ? '↓' : '↑'} {Math.abs(fileDiff)} file
                  {Math.abs(fileDiff) !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
