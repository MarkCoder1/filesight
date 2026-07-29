'use client';

import { CATEGORY_COLORS } from '@/lib/constants';
import { formatBytes } from '@/lib/utils';
import type { StorageByCategory } from '@/types';

interface CategoryBreakdownProps {
  categories: StorageByCategory[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full">
        {categories.map((cat) => (
          <div
            key={cat.category}
            className="transition-all hover:opacity-80"
            style={{
              width: `${cat.percentage}%`,
              backgroundColor: CATEGORY_COLORS[cat.category] || '#6b7280',
            }}
          />
        ))}
      </div>

      <div className="space-y-2">
        {categories
          .sort((a, b) => b.totalSize - a.totalSize)
          .map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#6b7280' }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize">{cat.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(cat.totalSize)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[cat.category] || '#6b7280',
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
