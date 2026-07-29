'use client';

import { HardDrive } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StorageCard({ totalSize = '2.1 GB' }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalSize}</div>
        <div className="flex items-center gap-2 pt-1">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-3/5 rounded-full bg-primary" />
          </div>
          <span className="text-xs text-muted-foreground">60%</span>
        </div>
        <p className="pt-1 text-xs text-muted-foreground">of 256 GB available</p>
      </CardContent>
    </Card>
  );
}
