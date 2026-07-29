'use client';

import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { FileCategory } from '@/types';
import type { FileFiltersState, SizeRange, SortField } from '@/hooks/use-file-filters';

interface FileFiltersProps {
  filters: FileFiltersState;
  onCategoryChange: (category: FileCategory | 'all') => void;
  onSizeRangeChange: (range: SizeRange) => void;
  onSortByChange: (field: SortField) => void;
  onToggleSortOrder: () => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

const CATEGORIES: (FileCategory | 'all')[] = [
  'all',
  'images',
  'videos',
  'documents',
  'archives',
  'installers',
  'applications',
  'audio',
  'code',
  'other',
];

const SIZE_LABELS: Record<SizeRange, string> = {
  all: 'All sizes',
  small: '< 1 MB',
  medium: '1–10 MB',
  large: '10–100 MB',
  huge: '> 100 MB',
};

const SORT_LABELS: Record<SortField, string> = {
  name: 'Name',
  size: 'Size',
  modifiedAt: 'Modified',
  category: 'Type',
};

export function FileFilters({
  filters,
  onCategoryChange,
  onSizeRangeChange,
  onSortByChange,
  onToggleSortOrder,
  onReset,
  hasActiveFilters,
  resultCount,
}: FileFiltersProps) {
  const SortIcon = filters.sortOrder === 'asc' ? ArrowUp : ArrowDown;
  const sizeRanges: SizeRange[] = ['all', 'small', 'medium', 'large', 'huge'];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Category</span>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={filters.category === cat ? 'default' : 'secondary'}
              className="cursor-pointer capitalize"
              onClick={() => onCategoryChange(cat)}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] ?? cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Size</span>
        <div className="flex flex-wrap gap-1">
          {sizeRanges.map((range) => (
            <Badge
              key={range}
              variant={filters.sizeRange === range ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onSizeRangeChange(range)}
            >
              {SIZE_LABELS[range]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Sort</span>
          <div className="flex gap-1">
            {(Object.keys(SORT_LABELS) as SortField[]).map((field) => (
              <Badge
                key={field}
                variant={filters.sortBy === field ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => onSortByChange(field)}
              >
                {SORT_LABELS[field]}
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleSortOrder}
            title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <SortIcon className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{resultCount} file{resultCount !== 1 ? 's' : ''}</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onReset}>
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
