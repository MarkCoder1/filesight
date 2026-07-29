'use client';

import { FolderTree } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoriesCardProps {
  count?: number;
}

export function CategoriesCard({ count = 0 }: CategoriesCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Categories</CardTitle>
        <FolderTree className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="pt-1 text-xs text-muted-foreground">
          {count > 0 ? 'file types detected' : 'scan to detect'}
        </p>
      </CardContent>
    </Card>
  );
}
