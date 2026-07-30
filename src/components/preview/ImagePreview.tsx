'use client';

import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useIpc } from '@/hooks/use-ipc';
import { logPreviewError, logPreviewSuccess } from '@/lib/preview-logger';
import path from '@/lib/path-utils';

interface ImagePreviewProps {
  filePath: string;
}

export function ImagePreview({ filePath }: ImagePreviewProps) {
  const { readImageFile } = useIpc();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ext = path.extname(filePath);
    readImageFile(filePath)
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          logPreviewSuccess(filePath, ext, 'readImageFile', 'image');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(true);
          logPreviewError(filePath, ext, 'readImageFile', err, 'image');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [filePath, readImageFile]);

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Unable to load image</p>
      </div>
    );
  }

  if (!dataUrl) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  return (
    <div className="flex items-center justify-center rounded-lg bg-black/5 p-2">
      <img src={dataUrl} alt="Preview" className="max-h-96 max-w-full rounded object-contain" />
    </div>
  );
}
