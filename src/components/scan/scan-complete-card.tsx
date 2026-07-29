'use client';

import { CheckCircle2, FileIcon, HardDrive } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import type { ScanResult } from '@/types';

interface ScanCompleteCardProps {
  result: ScanResult;
  onViewDashboard: () => void;
  onRescan: () => void;
}

export function ScanCompleteCard({
  result,
  onViewDashboard,
  onRescan,
}: ScanCompleteCardProps) {
  return (
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl">Scan Complete</CardTitle>
        <CardDescription>
          Successfully scanned {result.files.length > 0 ? 'your folder' : 'the folder'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <FileIcon className="h-4 w-4" />
              <span>Files</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {result.totalFiles.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span>Storage</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatBytes(result.totalSize)}
            </p>
          </div>
        </div>

        {result.errors.length > 0 && (
          <p className="text-xs text-amber-500">
            {result.errors.length} error{result.errors.length > 1 ? 's' : ''} encountered
          </p>
        )}

        <div className="flex gap-2">
          <Button className="flex-1 hover:cursor-pointer" onClick={onViewDashboard}>
            View Dashboard
          </Button>
          <Button variant="outline" className="hover:cursor-pointer" onClick={onRescan}>
            Rescan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
