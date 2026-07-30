'use client';

import { Copy, FileText, Fingerprint, Hash, ImageIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';

interface DuplicateSummaryProps {
  groupCount: number;
  totalDuplicates: number;
  wastedSpace: number;
  categories?: { exact: number; similarImages: number; similarDocuments: number; filename: number };
  isScanning?: boolean;
}

export function DuplicateSummary({
  groupCount,
  totalDuplicates,
  wastedSpace,
  categories,
  isScanning,
}: DuplicateSummaryProps) {
  if (isScanning) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <Copy className="h-8 w-8 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Scanning for duplicates...</p>
        </CardContent>
      </Card>
    );
  }

  if (groupCount === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <Copy className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No duplicate files found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Copy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{groupCount} duplicate group{groupCount !== 1 ? 's' : ''}</p>
            <p className="text-sm text-muted-foreground">
              {totalDuplicates} file{totalDuplicates !== 1 ? 's' : ''} &middot;{' '}
              <span className="font-medium text-destructive">
                {formatBytes(wastedSpace)}
              </span>{' '}
              can potentially be recovered
            </p>
          </div>
        </div>
        {categories && (
          <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
            {categories.exact > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hash className="h-3.5 w-3.5 text-red-500" />
                <span>{categories.exact} exact</span>
              </div>
            )}
            {categories.similarImages > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                <span>{categories.similarImages} similar images</span>
              </div>
            )}
            {categories.similarDocuments > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-green-500" />
                <span>{categories.similarDocuments} similar documents</span>
              </div>
            )}
            {categories.filename > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fingerprint className="h-3.5 w-3.5 text-amber-500" />
                <span>{categories.filename} filename matches</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
