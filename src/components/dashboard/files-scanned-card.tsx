'use client';

import { FileSearch } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilesScannedCardProps {
  count?: number;
  folderName?: string;
}

export function FilesScannedCard({
  count = 0,
  folderName = 'Downloads',
}: FilesScannedCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Files Scanned</CardTitle>
        <FileSearch className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count.toLocaleString()}</div>
        <p className="pt-1 text-xs text-muted-foreground">
          {count > 0 ? `in ${folderName}` : 'No scan yet'}
        </p>
      </CardContent>
    </Card>
  );
}
