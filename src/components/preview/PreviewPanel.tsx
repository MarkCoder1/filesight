'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatBytes } from '@/lib/utils';
import type { FileEntry, PreviewType } from '@/types';
import { getPreviewType } from '@/types';

import { AudioPreview } from './AudioPreview';
import { FileActions } from './FileActions';
import { FileInfo } from './FileInfo';
import { ImagePreview } from './ImagePreview';
import { PdfPreview } from './PdfPreview';
import { TextPreview } from './TextPreview';
import { UnsupportedPreview } from './UnsupportedPreview';
import { VideoPreview } from './VideoPreview';

interface PreviewPanelProps {
  file: FileEntry;
  onClose: () => void;
}

function PreviewContent({ file }: { file: FileEntry }) {
  const previewType: PreviewType = getPreviewType(file.extension);

  switch (previewType) {
    case 'image':
      return <ImagePreview filePath={file.path} />;
    case 'text':
      return <TextPreview filePath={file.path} />;
    case 'pdf':
      return <PdfPreview filePath={file.path} />;
    case 'audio':
      return <AudioPreview filePath={file.path} />;
    case 'video':
      return <VideoPreview filePath={file.path} />;
    case 'unsupported':
      return <UnsupportedPreview extension={file.extension} size={formatBytes(file.size)} />;
  }
}

export function PreviewPanel({ file, onClose }: PreviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, [file]);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="flex h-full w-full flex-col overflow-hidden border-l bg-background"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="truncate text-sm font-semibold">{file.name}</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <PreviewContent file={file} />

        <Separator className="my-4" />

        <FileInfo file={file} />

        <Separator className="my-4" />

        <FileActions filePath={file.path} fileName={file.name} />
      </div>
    </div>
  );
}
