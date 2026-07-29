import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  type LucideIcon,
  Package,
  Terminal,
  File,
} from 'lucide-react';

import type { FileCategory } from '@/types';

const categoryIconMap: Record<FileCategory, LucideIcon> = {
  images: FileImage,
  videos: FileVideo,
  documents: FileText,
  archives: FileArchive,
  installers: Package,
  applications: Terminal,
  audio: FileAudio,
  code: FileCode,
  other: File,
};

const categoryColorMap: Record<FileCategory, string> = {
  images: '#3b82f6',
  videos: '#ef4444',
  documents: '#f59e0b',
  archives: '#8b5cf6',
  installers: '#ec4899',
  applications: '#06b6d4',
  audio: '#10b981',
  code: '#6366f1',
  other: '#6b7280',
};

export function FileIcon({
  category,
  ...props
}: { category: FileCategory } & React.ComponentPropsWithoutRef<LucideIcon>) {
  const Icon = categoryIconMap[category] ?? File;
  return <Icon {...props} />;
}

export function getFileIconColor(category: FileCategory): string {
  return categoryColorMap[category] ?? '#6b7280';
}
