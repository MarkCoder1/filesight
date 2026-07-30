'use client';

import { AlertTriangle, FileX, FolderX, RefreshCw, ShieldX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  error: string;
  variant?: 'permission' | 'missing' | 'interrupted' | 'corrupted' | 'generic';
  onRetry?: () => void;
  onDismiss?: () => void;
}

const errorConfig: Record<Required<Props>['variant'], { icon: LucideIcon; title: string }> = {
  permission: {
    icon: ShieldX,
    title: 'Permission denied',
  },
  missing: {
    icon: FolderX,
    title: 'Folder not found',
  },
  interrupted: {
    icon: AlertTriangle,
    title: 'Scan interrupted',
  },
  corrupted: {
    icon: FileX,
    title: 'Data issue',
  },
  generic: {
    icon: AlertTriangle,
    title: 'Something went wrong',
  },
};

const friendlyMessages: Record<Required<Props>['variant'], string> = {
  permission:
    'The app does not have permission to access that folder. Try selecting a different folder or granting access in System Settings.',
  missing: 'The selected folder no longer exists. It may have been moved or deleted.',
  interrupted: 'The scan was interrupted before it could finish. You can try again.',
  corrupted:
    'Some scan data could not be read. This may be due to a corrupted file or unexpected format.',
  generic: 'An unexpected error occurred. Please try again.',
};

export function ErrorMessage({ error, variant = 'generic', onRetry, onDismiss }: Props) {
  const config = errorConfig[variant];

  return (
    <Card className="mx-auto max-w-md border-destructive/30">
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <config.icon className="h-7 w-7 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">{config.title}</p>
          <p className="text-sm text-muted-foreground">{friendlyMessages[variant]}</p>
          {variant === 'generic' && (
            <p className="mt-2 rounded-md bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground">
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
