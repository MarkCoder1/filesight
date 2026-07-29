'use client';

import { History } from 'lucide-react';

import { CleanupHistoryCard } from '@/components/history/CleanupHistoryCard';
import { ScanHistoryCard } from '@/components/history/ScanHistoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { CleanupHistoryRecord, ScanHistoryRecord } from '@/types';

interface HistoryTimelineProps {
  scans: ScanHistoryRecord[];
  loading: boolean;
  onScanClick?: (scan: ScanHistoryRecord) => void;
  latestCleanup?: CleanupHistoryRecord | null;
}

export function HistoryTimeline({
  scans,
  loading,
  onScanClick,
  latestCleanup,
}: HistoryTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <History className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No scan history yet.</p>
        <p className="text-xs text-muted-foreground">
          Scan your Downloads folder to start tracking history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scans.map((scan, i) => (
        <ScanHistoryCard
          key={scan.id}
          scan={scan}
          previousScan={i < scans.length - 1 ? scans[i + 1] : null}
          onClick={() => onScanClick?.(scan)}
        />
      ))}
      {latestCleanup && (
        <div className="pt-1">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Recent Cleanup</p>
          <CleanupHistoryCard cleanup={latestCleanup} />
        </div>
      )}
    </div>
  );
}
