'use client';

import { ArrowLeft, BarChart3, FileWarning, HardDrive, History, Layers, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { CategoryTrendChart } from '@/components/history/CategoryTrendChart';
import { CleanupHistoryCard } from '@/components/history/CleanupHistoryCard';
import { HistoryTimeline } from '@/components/history/HistoryTimeline';
import { ScanComparison } from '@/components/history/ScanComparison';
import { StorageTrendChart } from '@/components/history/StorageTrendChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistory } from '@/hooks/use-history';
import { formatBytes } from '@/lib/utils';

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

export function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get('id');
  const compareId = searchParams.get('compare');

  const {
    scans,
    totalScans,
    loading,
    selectedScan,
    comparison,
    latestCleanup,
    totalRecovered,
    fetchScans,
    fetchScanDetail,
    fetchComparison,
    fetchLatestCleanup,
    fetchTotalRecovered,
  } = useHistory();

  useEffect(() => {
    if (detailId) {
      fetchScanDetail(detailId);
    } else {
      fetchScans();
      fetchLatestCleanup();
      fetchTotalRecovered();
    }
  }, [detailId, fetchScans, fetchScanDetail, fetchLatestCleanup, fetchTotalRecovered]);

  useEffect(() => {
    if (compareId && detailId && compareId !== detailId) {
      fetchComparison(detailId, compareId);
    }
  }, [compareId, detailId, fetchComparison]);

  const latestScan = scans[0] ?? null;
  const previousScan = scans[1] ?? null;
  const sizeDiff = latestScan && previousScan ? latestScan.totalSize - previousScan.totalSize : 0;

  const goBack = useCallback(() => {
    router.push('/history');
  }, [router]);

  if (detailId && selectedScan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Scan Details</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(selectedScan.date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {comparison && (
          <ScanComparison
            scan1={comparison.scan1}
            scan2={comparison.scan2}
            storageDifference={comparison.storageDifference}
            fileDifference={comparison.fileDifference}
            categoryChanges={comparison.categoryChanges}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                Total Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatBytes(selectedScan.totalSize)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Total Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{selectedScan.totalFiles.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileWarning className="h-4 w-4 text-muted-foreground" />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{selectedScan.suggestionCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
                Duplicates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatBytes(selectedScan.duplicateSize)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedScan.categories.map((cat) => (
                <div key={cat.category}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] ?? '#6b7280' }} />
                      <span className="font-medium capitalize">{cat.category}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatBytes(cat.totalSize)} &middot; {cat.count} file{cat.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full transition-all" style={{ width: `${cat.percentage}%`, backgroundColor: CATEGORY_COLORS[cat.category] ?? '#6b7280' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedScan.largestFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Largest Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedScan.largestFiles.map((file, i) => (
                  <div key={`${file.path}-${i}`} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                    <span className="w-5 text-center text-xs font-medium text-muted-foreground">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{file.path}</p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums font-medium">{formatBytes(file.size)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (detailId && loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scan History</h1>
        <p className="text-sm text-muted-foreground">
          Past scans and cleanup activities
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{totalScans}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Storage</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <>
                <p className="text-2xl font-bold">{latestScan ? formatBytes(latestScan.totalSize) : '—'}</p>
                {previousScan && (
                  <p className={`text-xs ${sizeDiff <= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                    {sizeDiff <= 0 ? '↓' : '↑'} {formatBytes(Math.abs(sizeDiff))} from previous
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatBytes(totalRecovered)}</p>
            {latestCleanup && (
              <p className="text-xs text-muted-foreground">Last cleanup: {new Date(latestCleanup.date).toLocaleDateString()}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Storage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StorageTrendChart scans={scans} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Category Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryTrendChart scans={scans} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">Timeline</h2>
            {scans.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => router.push(`/history?id=${scans[1].id}&compare=${scans[0].id}`)}
              >
                Compare latest scans
              </Button>
            )}
          </div>
          <HistoryTimeline
            scans={scans}
            loading={loading}
            onScanClick={(scan) => router.push(`/history?id=${scan.id}`)}
            latestCleanup={latestCleanup}
          />
        </div>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Cleanup History</h2>
          </div>
          {latestCleanup ? (
            <CleanupHistoryCard cleanup={latestCleanup} />
          ) : (
            <p className="text-xs text-muted-foreground">No cleanup activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
