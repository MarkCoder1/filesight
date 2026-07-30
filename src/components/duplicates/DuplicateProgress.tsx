'use client';

import { Copy, FileText, Fingerprint, Hash, ImageIcon, Monitor, Sparkles } from 'lucide-react';

import type { ScanStage } from '@/types';

interface DuplicateProgressProps {
  currentFile: string;
  processedFiles: number;
  totalFiles: number;
  percentage: number;
  stage?: ScanStage;
}

const stageConfig: Record<ScanStage, { label: string; icon: typeof Copy }> = {
  metadata: { label: 'Analyzing file metadata...', icon: Copy },
  filename: { label: 'Comparing filenames...', icon: Fingerprint },
  hashing: { label: 'Computing file hashes...', icon: Hash },
  perceptual: { label: 'Comparing images...', icon: ImageIcon },
  document: { label: 'Comparing documents...', icon: FileText },
  video: { label: 'Comparing videos...', icon: Monitor },
  recommending: { label: 'Computing recommendations...', icon: Sparkles },
};

export function DuplicateProgress({
  currentFile,
  processedFiles,
  totalFiles,
  percentage,
  stage,
}: DuplicateProgressProps) {
  const config = stage ? stageConfig[stage] : stageConfig.hashing;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <config.icon className="h-4 w-4 animate-pulse text-amber-500" />
        <p className="text-sm font-medium">{config.label}</p>
      </div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span className="truncate max-w-[60%]">{currentFile}</span>
        <span>
          {processedFiles} / {totalFiles}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
