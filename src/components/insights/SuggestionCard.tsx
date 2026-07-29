'use client';

import { AlertCircle, Archive, FileWarning } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import type { AnalysisSuggestion } from '@/types';

interface SuggestionCardProps {
  suggestion: AnalysisSuggestion;
  onTrash?: (files: { path: string; name: string; size: number }[]) => void;
}

const severityColors: Record<string, 'default' | 'destructive' | 'secondary'> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

const suggestionIcons: Record<string, React.ReactNode> = {
  'old-installers': <Archive className="h-4 w-4" />,
  'large-files': <FileWarning className="h-4 w-4" />,
  'stale-archives': <Archive className="h-4 w-4" />,
};

export function SuggestionCard({ suggestion, onTrash }: SuggestionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            {suggestionIcons[suggestion.type] ?? <AlertCircle className="h-4 w-4" />}
          </div>
          <div>
            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
          </div>
        </div>
        <Badge variant={severityColors[suggestion.severity] ?? 'secondary'}>
          {suggestion.severity}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-xs text-muted-foreground">{suggestion.description}</p>
        <p className="mb-3 text-xs text-muted-foreground">{suggestion.detail}</p>
        <div className="flex items-center justify-between border-t pt-2 text-xs">
          <span className="text-muted-foreground">
            {suggestion.fileCount} file{suggestion.fileCount !== 1 ? 's' : ''} &middot;{' '}
            {formatBytes(suggestion.totalSize)}
          </span>
          {suggestion.files.length > 0 && onTrash && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs hover:cursor-pointer"
              onClick={() => onTrash(suggestion.files)}
            >
              Review & Move to Trash
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
