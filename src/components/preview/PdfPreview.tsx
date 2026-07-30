'use client';

import { useEffect, useRef, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useIpc } from '@/hooks/use-ipc';
import { base64ToBlobUrl } from '@/lib/utils';

interface PdfPreviewProps {
  filePath: string;
}

export function PdfPreview({ filePath }: PdfPreviewProps) {
  const { readFileBase64 } = useIpc();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    readFileBase64(filePath)
      .then((result) => {
        if (cancelled) return;
        if (result.tooLarge || !result.data) {
          setError(true);
          return;
        }
        const blobUrl = base64ToBlobUrl(result.data, result.mime);
        urlRef.current = blobUrl;
        setUrl(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
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
      <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          This PDF is too large to preview inline.{' '}
          <span className="text-xs">Try opening it with an external viewer.</span>
        </p>
      </div>
    );
  }

  if (!url) {
    return <Skeleton className="h-96 w-full rounded-lg" />;
  }

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-lg border">
      <iframe
        src={url}
        className="h-full w-full"
        title="PDF Preview"
      />
    </div>
  );
}
