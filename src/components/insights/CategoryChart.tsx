'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORY_COLORS } from '@/lib/constants';
import { formatBytes } from '@/lib/utils';
import type { StorageByCategory } from '@/types';

interface CategoryChartProps {
  categories: StorageByCategory[];
}

export function CategoryChart({ categories }: CategoryChartProps) {
  const data = categories
    .filter((c) => c.count > 0)
    .map((c) => ({
      name: c.category,
      size: c.totalSize,
      count: c.count,
      fill: CATEGORY_COLORS[c.category] ?? '#6b7280',
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storage by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">No data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Storage by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20, top: 10, bottom: 10 }}>
              <XAxis
                type="number"
                tickFormatter={(v: number) => formatBytes(v)}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, textAnchor: 'end' }}
                width={70}
              />
              <Tooltip
                formatter={(value: unknown, _name: unknown, entry: unknown) => {
                  const v = value as number;
                  const p = entry as { payload?: { count?: number } };
                  return [`${formatBytes(v)} (${p?.payload?.count ?? 0} files)`, 'Storage'] as [string, string];
                }}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="size" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-xs">
          {data.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.fill }} />
              <span className="truncate capitalize text-muted-foreground">{c.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
