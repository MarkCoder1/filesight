'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatBytes } from '@/lib/utils';
import type { ScanHistoryRecord } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  images: '#3b82f6',
  videos: '#ef4444',
  documents: '#22c55e',
  archives: '#f59e0b',
  installers: '#8b5cf6',
  applications: '#ec4899',
  audio: '#14b8a6',
  code: '#6366f1',
  other: '#6b7280',
};

interface CategoryTrendChartProps {
  scans: ScanHistoryRecord[];
}

export function CategoryTrendChart({ scans }: CategoryTrendChartProps) {
  if (scans.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
        Need at least 2 scans to show category trends
      </div>
    );
  }

  const categories = new Set<string>();
  for (const scan of scans) {
    for (const cat of scan.categories) {
      categories.add(cat.category);
    }
  }

  const data = [...scans].reverse().map((s) => {
    const point: Record<string, string | number> = {
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    for (const cat of categories) {
      const match = s.categories.find((c) => c.category === cat);
      point[cat] = match ? Math.round(match.totalSize / (1024 * 1024)) : 0;
    }
    return point;
  });

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
          <YAxis className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} MB`} />
          <Tooltip
            formatter={(value: unknown) => [formatBytes(Number(value) * 1024 * 1024)]}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          {Array.from(categories).map((cat) => (
            <Bar
              key={cat}
              dataKey={cat}
              name={cat.charAt(0).toUpperCase() + cat.slice(1)}
              stackId="a"
              fill={CATEGORY_COLORS[cat] ?? '#6b7280'}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
