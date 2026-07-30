'use client';

import { FileWarning } from 'lucide-react';

interface UnsupportedPreviewProps {
  extension: string;
  size: string;
}

export function UnsupportedPreview({ extension, size }: UnsupportedPreviewProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-muted py-12">
      <FileWarning className="mb-3 h-12 w-12 text-muted-foreground/50" />
      <h3 className="mb-1 text-sm font-medium">Preview not available</h3>
      <p className="mb-4 text-xs text-muted-foreground">This file type cannot be previewed.</p>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          Extension: <span className="font-mono font-medium text-foreground">.{extension}</span>
        </p>
        <p>
          Size: <span className="font-medium text-foreground">{size}</span>
        </p>
      </div>
    </div>
  );
}
