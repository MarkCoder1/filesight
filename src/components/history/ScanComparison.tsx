'use client';

import { formatBytes, formatRelativeDate } from '@/lib/utils';
import type { ScanHistoryRecord } from '@/types';

interface ScanComparisonProps {
  scan1: ScanHistoryRecord;
  scan2: ScanHistoryRecord;
  storageDifference: number;
  fileDifference: number;
  categoryChanges: { category: string; countDiff: number; sizeDiff: number }[];
}

export function ScanComparison({
  scan1,
  scan2,
  storageDifference,
  fileDifference,
  categoryChanges,
}: ScanComparisonProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-medium">Comparison</p>
      </div>
      <div className="grid grid-cols-2 divide-x">
        <div className="space-y-2 p-4">
          <p className="text-xs text-muted-foreground">Previous</p>
          <p className="text-xs">{formatRelativeDate(new Date(scan1.date))}</p>
          <p className="text-lg font-bold">{formatBytes(scan1.totalSize)}</p>
          <p className="text-xs text-muted-foreground">{scan1.totalFiles.toLocaleString()} files</p>
        </div>
        <div className="space-y-2 p-4">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-xs">{formatRelativeDate(new Date(scan2.date))}</p>
          <p className="text-lg font-bold">{formatBytes(scan2.totalSize)}</p>
          <p className="text-xs text-muted-foreground">{scan2.totalFiles.toLocaleString()} files</p>
        </div>
      </div>
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Storage: </span>
            <span
              className={
                storageDifference <= 0
                  ? 'font-medium text-green-600 dark:text-green-400'
                  : 'font-medium text-destructive'
              }
            >
              {storageDifference <= 0 ? '↓' : '↑'} {formatBytes(Math.abs(storageDifference))}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Files: </span>
            <span
              className={
                fileDifference <= 0
                  ? 'font-medium text-green-600 dark:text-green-400'
                  : 'font-medium text-destructive'
              }
            >
              {fileDifference <= 0 ? '↓' : '↑'} {Math.abs(fileDifference)}
            </span>
          </div>
        </div>
      </div>
      {categoryChanges.length > 0 && (
        <div className="border-t px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Category Changes</p>
          <div className="space-y-1">
            {categoryChanges.map((cc) => (
              <div key={cc.category} className="flex items-center justify-between text-xs">
                <span className="capitalize">{cc.category}</span>
                <div className="flex gap-3">
                  <span
                    className={
                      cc.countDiff <= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                    }
                  >
                    {cc.countDiff <= 0 ? '↓' : '↑'} {Math.abs(cc.countDiff)}
                  </span>
                  <span
                    className={
                      cc.sizeDiff <= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                    }
                  >
                    {formatBytes(Math.abs(cc.sizeDiff))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
