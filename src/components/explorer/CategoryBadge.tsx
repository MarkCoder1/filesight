'use client';

import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/fileCategories';
import type { FileCategory } from '@/types';

interface CategoryBadgeProps {
  category: FileCategory;
  onClick?: () => void;
  selected?: boolean;
}

export function CategoryBadge({ category, onClick, selected }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] ?? '#6b7280';
  const label = CATEGORY_LABELS[category] ?? category;

  const base =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors';
  const cursorClass = onClick ? 'cursor-pointer' : '';
  const selectedClass = selected ? '' : 'bg-muted text-muted-foreground hover:bg-accent';

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`${base} ${cursorClass} ${selectedClass}`}
      style={selected ? { backgroundColor: `${color}20`, color } : undefined}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
