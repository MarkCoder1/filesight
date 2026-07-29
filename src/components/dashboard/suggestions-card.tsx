'use client';

import { Lightbulb } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SuggestionsCardProps {
  count?: number;
  totalSize?: string;
}

export function SuggestionsCard({ count = 0, totalSize = '0 B' }: SuggestionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{count}</span>
          {count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalSize} reclaimable
            </Badge>
          )}
        </div>
        <p className="pt-1 text-xs text-muted-foreground">
          {count > 0 ? 'items recommended for cleanup' : 'no suggestions yet'}
        </p>
      </CardContent>
    </Card>
  );
}
