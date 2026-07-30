'use client';

import { FileImage, FileText, Film, Music, Archive, Package, FileQuestion } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import type { OrgCategory, OrgCategoryInfo } from '@/types';

const CATEGORY_ICONS: Record<OrgCategory, typeof FileImage> = {
  images: FileImage,
  documents: FileText,
  videos: Film,
  audio: Music,
  archives: Archive,
  installers: Package,
  unknown: FileQuestion,
};

const CATEGORY_COLORS: Record<OrgCategory, string> = {
  images: 'text-blue-500 bg-blue-500/10',
  documents: 'text-green-500 bg-green-500/10',
  videos: 'text-red-500 bg-red-500/10',
  audio: 'text-teal-500 bg-teal-500/10',
  archives: 'text-amber-500 bg-amber-500/10',
  installers: 'text-purple-500 bg-purple-500/10',
  unknown: 'text-gray-500 bg-gray-500/10',
};

interface CategoryCardProps {
  info: OrgCategoryInfo;
  isSelected: boolean;
  onToggle: () => void;
}

export function CategoryCard({ info, isSelected, onToggle }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[info.category];

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${isSelected ? 'border-primary ring-1 ring-primary' : ''}`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${CATEGORY_COLORS[info.category]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{info.label}</p>
            <p className="text-xs text-muted-foreground">
              {info.fileCount} file{info.fileCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs font-medium tabular-nums">{formatBytes(info.totalSize)}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{info.suggestedPath}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
