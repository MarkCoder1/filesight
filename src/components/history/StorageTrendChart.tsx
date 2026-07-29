'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatBytes } from '@/lib/utils';
import type { ScanHistoryRecord } from '@/types';

interface StorageTrendChartProps {
  scans: ScanHistoryRecord[];
}

export function StorageTrendChart({ scans }: StorageTrendChartProps) {
  if (scans.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
        Need at least 2 scans to show trend
      </div>
    );
  }

  const data = [...scans].reverse().map((s) => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    size: Math.round(s.totalSize / (1024 * 1024)),
    fullSize: s.totalSize,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: unknown) => `${v} MB`}
          />
          <Tooltip
            formatter={(value: unknown) => [formatBytes(Number(value) * 1024 * 1024), 'Storage']}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="size"
            stroke="hsl(var(--primary))"
            fill="url(#storageGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
