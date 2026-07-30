'use client';

import { useEffect, useRef, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useIpc } from '@/hooks/use-ipc';
import { logPreviewError, logPreviewSuccess } from '@/lib/preview-logger';
import { extname } from '@/lib/path-utils';
import { base64ToBlobUrl, formatBytes } from '@/lib/utils';

interface AudioPreviewProps {
  filePath: string;
}

export function AudioPreview({ filePath }: AudioPreviewProps) {
  const { readFileBase64 } = useIpc();
  const [url, setUrl] = useState<string | null>(null);
  const [tooLarge, setTooLarge] = useState(false);
  const [size, setSize] = useState(0);
  const [error, setError] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ext = extname(filePath);
    readFileBase64(filePath)
      .then((result) => {
        if (cancelled) return;
        if (result.tooLarge) {
          setTooLarge(true);
          setSize(result.size);
          logPreviewError(filePath, ext, 'readFileBase64', new Error('File too large'), 'audio');
          return;
        }
        if (!result.data) {
          setError(true);
          logPreviewError(filePath, ext, 'readFileBase64', new Error('No data returned'), 'audio');
          return;
        }
        const blobUrl = base64ToBlobUrl(result.data, result.mime);
        urlRef.current = blobUrl;
        setUrl(blobUrl);
        logPreviewSuccess(filePath, ext, 'readFileBase64', 'audio');
      })
      .catch((err) => {
        if (!cancelled) {
          setError(true);
          logPreviewError(filePath, ext, 'readFileBase64', err, 'audio');
        }
      });
    return () => {
      cancelled = true;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, [filePath, readFileBase64]);

  if (error) {
    return (
      <div className="flex h-16 items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Unable to load audio</p>
      </div>
    );
  }

  if (tooLarge) {
    return (
      <div className="flex h-16 items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          Audio too large to preview ({formatBytes(size)}). Open file externally.
        </p>
      </div>
    );
  }

  if (!url) {
    return <Skeleton className="h-16 w-full rounded-lg" />;
  }

  return (
    <div className="flex items-center justify-center rounded-lg bg-muted p-4">
      <audio controls className="w-full max-w-md" preload="metadata">
        <source src={url} />
      </audio>
    </div>
  );
}
