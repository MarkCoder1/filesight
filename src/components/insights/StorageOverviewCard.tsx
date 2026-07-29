'use client';

import { HardDrive } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import type { StorageStats } from '@/types';

interface StorageOverviewCardProps {
  stats: StorageStats;
  path: string;
}

export function StorageOverviewCard({ stats, path }: StorageOverviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Storage Overview</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
        <p className="text-xs text-muted-foreground">{stats.totalFiles} files</p>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
          <div>
            <span className="text-muted-foreground">Average size</span>
            <p className="font-medium">{formatBytes(stats.averageSize)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Largest file</span>
            <p className="truncate font-medium">{stats.largestFile?.name ?? '—'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Smallest file</span>
            <p className="truncate font-medium">{stats.smallestFile?.name ?? '—'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Folder</span>
            <p className="truncate font-medium">{path}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
