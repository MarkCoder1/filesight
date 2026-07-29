'use client';

import { RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/fileCategories';
import { DATE_FILTERS, SIZE_FILTERS, type FileFilters } from '@/lib/fileFiltering';
import type { FileCategory } from '@/types';

interface FilterPanelProps {
  filters: FileFilters;
  onCategoryChange: (category: FileCategory | 'all') => void;
  onSizeChange: (size: FileFilters['size']) => void;
  onDateChange: (date: FileFilters['date']) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

export function FilterPanel({
  filters,
  onCategoryChange,
  onSizeChange,
  onDateChange,
  onReset,
  hasActiveFilters,
  resultCount,
}: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={filters.category === 'all' ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => onCategoryChange('all')}
          >
            All
          </Badge>
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={filters.category === cat ? 'default' : 'secondary'}
              className="cursor-pointer capitalize"
              onClick={() => onCategoryChange(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Size</p>
        <div className="flex flex-wrap gap-1.5">
          {SIZE_FILTERS.map((opt) => (
            <Badge
              key={opt.value}
              variant={filters.size === opt.value ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onSizeChange(opt.value)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Date modified</p>
        <div className="flex flex-wrap gap-1.5">
          {DATE_FILTERS.map((opt) => (
            <Badge
              key={opt.value}
              variant={filters.date === opt.value ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onDateChange(opt.value)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">
          {resultCount} file{resultCount !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onReset}>
            <RotateCcw className="h-3 w-3" />
            Reset filters
          </Button>
        )}
      </div>
    </div>
  );
}
