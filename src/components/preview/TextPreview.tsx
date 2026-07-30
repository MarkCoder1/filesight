'use client';

import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useIpc } from '@/hooks/use-ipc';

interface TextPreviewProps {
  filePath: string;
}

export function TextPreview({ filePath }: TextPreviewProps) {
  const { readTextFile } = useIpc();
  const [content, setContent] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readTextFile(filePath)
      .then((result) => {
        if (!cancelled) {
          setContent(result.content);
          setTruncated(result.truncated);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, [filePath, readTextFile]);

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Unable to read file</p>
      </div>
    );
  }

  if (content === null) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  return (
    <div className="space-y-2">
      {truncated && (
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          File truncated. Preview shows the beginning of a large file.
        </p>
      )}
      <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
        <code>{content}</code>
      </pre>
    </div>
  );
}
