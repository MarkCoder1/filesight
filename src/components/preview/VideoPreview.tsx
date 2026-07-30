'use client';

import { useEffect, useRef, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useIpc } from '@/hooks/use-ipc';
import { logPreviewError, logPreviewSuccess } from '@/lib/preview-logger';
import { extname } from '@/lib/path-utils';
import { base64ToBlobUrl, formatBytes } from '@/lib/utils';

interface VideoPreviewProps {
  filePath: string;
}

export function VideoPreview({ filePath }: VideoPreviewProps) {
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
          logPreviewError(filePath, ext, 'readFileBase64', new Error('File too large'), 'video');
          return;
        }
        if (!result.data) {
          setError(true);
          logPreviewError(filePath, ext, 'readFileBase64', new Error('No data returned'), 'video');
          return;
        }
        const blobUrl = base64ToBlobUrl(result.data, result.mime);
        urlRef.current = blobUrl;
        setUrl(blobUrl);
        logPreviewSuccess(filePath, ext, 'readFileBase64', 'video');
      })
      .catch((err) => {
        if (!cancelled) {
          setError(true);
          logPreviewError(filePath, ext, 'readFileBase64', err, 'video');
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
      <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Unable to load video</p>
      </div>
    );
  }

  if (tooLarge) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          Video too large to preview ({formatBytes(size)}). Open file externally.
        </p>
      </div>
    );
  }

  if (!url) {
    return <Skeleton className="aspect-video w-full rounded-lg" />;
  }

  return (
    <div className="flex items-center justify-center rounded-lg bg-black/5">
      <video controls className="max-h-96 w-full rounded" preload="metadata">
        <source src={url} />
      </video>
    </div>
  );
}
