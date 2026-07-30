import { FileWarning, Search, ShieldCheck, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {
  variant: 'no-scans' | 'no-duplicates' | 'no-suggestions' | 'no-search' | 'no-history';
  onAction?: () => void;
}

const config: Record<
  Props['variant'],
  {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
  }
> = {
  'no-scans': {
    icon: FileWarning,
    title: 'No scans yet',
    description: 'Run your first scan to start tracking storage changes.',
    actionLabel: 'Scan Now',
    actionHref: '/',
  },
  'no-duplicates': {
    icon: ShieldCheck,
    title: 'Great!',
    description: 'No duplicate files were found.',
  },
  'no-suggestions': {
    icon: Trash2,
    title: 'Looks clean',
    description: 'Your Downloads folder looks clean.',
  },
  'no-search': {
    icon: Search,
    title: 'No results',
    description: 'No files match your search. Try another keyword or filter.',
  },
  'no-history': {
    icon: Search,
    title: 'No history yet',
    description: 'Scan history will appear here after your first scan.',
    actionLabel: 'Start Scan',
    actionHref: '/',
  },
};

export function EmptyState({ variant, onAction }: Props) {
  const c = config[variant];

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <c.icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-base font-semibold">{c.title}</h3>
      <p className="mb-5 max-w-xs text-sm text-muted-foreground">{c.description}</p>
      {c.actionLabel &&
        (c.actionHref ? (
          <Link href={c.actionHref}>
            <Button variant="outline" size="sm">
              {c.actionLabel}
            </Button>
          </Link>
        ) : onAction ? (
          <Button variant="outline" size="sm" onClick={onAction}>
            {c.actionLabel}
          </Button>
        ) : null)}
    </div>
  );
}
