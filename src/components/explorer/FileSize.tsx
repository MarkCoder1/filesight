'use client';

import { formatBytes } from '@/lib/utils';

interface FileSizeProps {
  bytes: number;
}

export function FileSize({ bytes }: FileSizeProps) {
  return <span className="tabular-nums text-muted-foreground">{formatBytes(bytes)}</span>;
}
