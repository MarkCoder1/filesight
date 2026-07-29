'use client';

import { Download, FolderOpen, Loader2 } from 'lucide-react';

import { LogoIcon } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

interface HeroSectionProps {
  onScanDownloads?: () => void;
  onChooseFolder?: () => void;
  isScanning?: boolean;
  selectedFolder?: string | null;
}

export function HeroSection({
  onScanDownloads,
  onChooseFolder,
  isScanning = false,
  selectedFolder,
}: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
        <LogoIcon size={34} className="text-primary-foreground" />
      </div>

      <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
        {APP_NAME}
      </h1>

      <p className="mb-8 max-w-lg text-lg text-muted-foreground">
        {APP_TAGLINE}
      </p>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          size="xl"
          className="gap-2 shadow-lg shadow-primary/20 hover:cursor-pointer"
          onClick={onScanDownloads}
          disabled={isScanning}
        >
          {isScanning ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {isScanning ? 'Scanning...' : 'Scan Downloads'}
        </Button>
        <Button
          size="xl"
          variant="outline"
          className="gap-2 hover:cursor-pointer"
          onClick={onChooseFolder}
          disabled={isScanning}
        >
          <FolderOpen className="h-5 w-5" />
          {selectedFolder ? `Scan "${selectedFolder.split('/').pop()}"` : 'Choose Folder'}
        </Button>
      </div>

      {selectedFolder && (
        <p className="mb-4 text-xs text-muted-foreground">
          Folder: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{selectedFolder}</code>
        </p>
      )}

      <div className="flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-sm text-muted-foreground">
        <LogoIcon size={16} className="text-primary" />
        Everything runs locally. No account required.
      </div>
    </div>
  );
}
