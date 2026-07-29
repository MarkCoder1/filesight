import { type LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatisticCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatisticCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
}: StatisticCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              iconBgColor ?? 'bg-primary/10',
            )}
          >
            <Icon
              className={cn('h-5 w-5', iconColor ?? 'text-primary')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
