'use client';

import { ClipboardCopy, Copy, ExternalLink, FolderOpen } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useIpc } from '@/hooks/use-ipc';

interface FileActionsProps {
  filePath: string;
  fileName: string;
}

export function FileActions({ filePath, fileName }: FileActionsProps) {
  const { openFile, openInFolder, copyToClipboard } = useIpc();
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  const handleOpenFile = useCallback(() => {
    openFile(filePath);
  }, [openFile, filePath]);

  const handleOpenInFolder = useCallback(() => {
    openInFolder(filePath);
  }, [openInFolder, filePath]);

  const handleCopyPath = useCallback(async () => {
    await copyToClipboard(filePath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  }, [copyToClipboard, filePath]);

  const handleCopyName = useCallback(async () => {
    await copyToClipboard(fileName);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2000);
  }, [copyToClipboard, fileName]);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleOpenFile}>
        <ExternalLink className="h-3.5 w-3.5" />
        Open
      </Button>

      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleOpenInFolder}>
        <FolderOpen className="h-3.5 w-3.5" />
        Show in Folder
      </Button>

      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyPath}>
        {copiedPath ? <ClipboardCopy className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        {copiedPath ? 'Copied!' : 'Copy Path'}
      </Button>

      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyName}>
        {copiedName ? <ClipboardCopy className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        {copiedName ? 'Copied!' : 'Copy Name'}
      </Button>
    </div>
  );
}
