'use client';

import { BarChart3, Clock, Copy, FileWarning, FolderTree, History, Lightbulb, List, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';

import { CleanupDialog } from '@/components/cleanup/CleanupDialog';
import { CleanupProgress } from '@/components/cleanup/CleanupProgress';
import { CleanupResult } from '@/components/cleanup/CleanupResult';
import { CleanupHistoryCard } from '@/components/history/CleanupHistoryCard';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { DuplicateProgress } from '@/components/duplicates/DuplicateProgress';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { CategoryChart } from '@/components/insights/CategoryChart';
import { LargestFilesCard } from '@/components/insights/LargestFilesCard';
import { OldFilesCard } from '@/components/insights/OldFilesCard';
import { StorageOverviewCard } from '@/components/insights/StorageOverviewCard';
import { SuggestionCard } from '@/components/insights/SuggestionCard';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingCard } from '@/components/shared/loading-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysis } from '@/hooks/use-analysis';
import { useCleanup } from '@/hooks/use-cleanup';
import { useDuplicate } from '@/hooks/use-duplicate';
import { useHistory } from '@/hooks/use-history';
import { useScanStore } from '@/hooks/use-scan-store';
import { formatBytes } from '@/lib/utils';

export default function DashboardPage() {
  const { lastResult } = useScanStore();
  const { analysis, isAnalyzing, runAnalysis } = useAnalysis();
  const insightsCleanup = useCleanup();
  const duplicate = useDuplicate();
  const { latestCleanup, totalRecovered, fetchLatestCleanup, fetchTotalRecovered } = useHistory();

  useEffect(() => {
    fetchLatestCleanup();
    fetchTotalRecovered();
  }, [fetchLatestCleanup, fetchTotalRecovered]);

  useEffect(() => {
    if (lastResult && lastResult.files.length > 0 && !analysis && !isAnalyzing) {
      runAnalysis(lastResult.files);
    }
  }, [lastResult, analysis, isAnalyzing, runAnalysis]);

  const handleInsightsTrash = useCallback(
    (files: { path: string; name: string; size: number }[]) => {
      insightsCleanup.showPreview(files);
    },
    [insightsCleanup],
  );

  const handleCleanupDone = useCallback(() => {
    insightsCleanup.reset();
  }, [insightsCleanup]);

  useEffect(() => {
    if (analysis && duplicate.isIdle && !duplicate.result) {
      duplicate.startScan(lastResult!.files);
    }
  }, [analysis, lastResult, duplicate]);

  if (!lastResult) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Scan your folder to see insights
          </p>
        </div>
        <EmptyState
          variant="no-scans"
          onAction={() => window.location.href = '/'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Insights for {lastResult.path}
        </p>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2">
            <List className="h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {isAnalyzing && <LoadingCard rows={2} />}

          {analysis && !isAnalyzing && (
            <>
              {/* 1. Storage overview */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StorageOverviewCard
                  stats={analysis.storageStats}
                  path={lastResult.path}
                />
              </div>

              {/* 2. Cleanup opportunities — suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileWarning className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium">Cleanup Opportunities</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {analysis.suggestions.map((s) => (
                      <SuggestionCard key={s.id} suggestion={s} onTrash={handleInsightsTrash} />
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Largest files + Old files */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      Largest Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LargestFilesCard files={analysis.largestFiles} onTrash={handleInsightsTrash} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Old Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OldFilesCard oldFiles={analysis.oldFiles} />
                  </CardContent>
                </Card>
              </div>

              {/* 4. Category chart + breakdown */}
              <div className="grid gap-6 lg:grid-cols-2">
                <CategoryChart categories={analysis.categories} />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FolderTree className="h-4 w-4 text-muted-foreground" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryBreakdown categories={analysis.categories} />
                  </CardContent>
                </Card>
              </div>

              {/* 5. Duplicates summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    Duplicate Files
                  </CardTitle>
                  {duplicate.isComplete && duplicate.result && duplicate.result.duplicateGroups.length > 0 && (
                    <Link href="/duplicates">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        View all
                      </Button>
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  {duplicate.isScanning && duplicate.progress && (
                    <DuplicateProgress
                      currentFile={duplicate.progress.currentFile}
                      processedFiles={duplicate.progress.processedFiles}
                      totalFiles={duplicate.progress.totalFiles}
                      percentage={duplicate.progress.percentage}
                    />
                  )}
                  {duplicate.isError && (
                    <p className="text-sm text-destructive">
                      Duplicate scan failed: {duplicate.error}
                    </p>
                  )}
                  {duplicate.isComplete && duplicate.result && (
                    <div>
                      {duplicate.result.duplicateGroups.length === 0 ? (
                        <EmptyState variant="no-duplicates" />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold">
                              {duplicate.result.duplicateGroups.length} group{duplicate.result.duplicateGroups.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatBytes(duplicate.result.wastedSpace)} wasted
                            </p>
                          </div>
                          <Link
                            href="/duplicates"
                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Review duplicates &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                  {duplicate.isIdle && !duplicate.result && (
                    <p className="text-sm text-muted-foreground">
                      Scan a folder to check for duplicates.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* 6. Recent activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4 text-muted-foreground" />
                    Recent Activity
                  </CardTitle>
                  <Link href="/history">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      View history
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Storage recovered</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatBytes(totalRecovered)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Last cleanup</p>
                      <p className="text-lg font-bold">
                        {latestCleanup
                          ? `${latestCleanup.filesMoved} file${latestCleanup.filesMoved !== 1 ? 's' : ''}`
                          : 'None'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cleanup dialog & progress */}
              <CleanupDialog
                open={insightsCleanup.isPreview}
                onOpenChange={(open) => {
                  if (!open && !insightsCleanup.isInProgress) insightsCleanup.reset();
                }}
                files={insightsCleanup.pendingFiles}
                onConfirm={insightsCleanup.execute}
                isProcessing={insightsCleanup.isInProgress}
              />

              {insightsCleanup.isInProgress && insightsCleanup.progress && (
                <div className="rounded-lg border bg-background p-4">
                  <CleanupProgress
                    current={insightsCleanup.progress.current}
                    total={insightsCleanup.progress.total}
                    currentFile={insightsCleanup.progress.currentFile}
                  />
                </div>
              )}

              {insightsCleanup.isComplete && insightsCleanup.result && (
                <div className="rounded-lg border bg-background p-4">
                  <CleanupResult result={insightsCleanup.result} onDone={handleCleanupDone} />
                </div>
              )}

              {insightsCleanup.isError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                  {insightsCleanup.error}
                  <button onClick={insightsCleanup.reset} className="ml-2 underline">
                    Dismiss
                  </button>
                </div>
              )}
            </>
          )}

          {!analysis && !isAnalyzing && (
            <p className="text-sm text-muted-foreground">
              No analysis results yet. Scan a folder first.
            </p>
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-muted-foreground" />
                File Explorer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileExplorer files={lastResult.files} onGoHome={() => window.location.href = '/'} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
