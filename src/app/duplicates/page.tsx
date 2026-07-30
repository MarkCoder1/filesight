'use client';

import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { DuplicateCard } from '@/components/duplicates/DuplicateCard';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useDuplicate } from '@/hooks/use-duplicate';
import { useScanStore } from '@/hooks/use-scan-store';

export default function DuplicatesPage() {
  const router = useRouter();
  const { lastResult } = useScanStore();
  const duplicate = useDuplicate();

  const handleRescan = useCallback(() => {
    if (lastResult) {
      duplicate.startScan(lastResult.files);
    }
  }, [lastResult, duplicate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Duplicate Files</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Find and review duplicate files</p>
        </div>
        <div className="flex gap-2">
          {duplicate.isComplete &&
            duplicate.result &&
            duplicate.result.duplicateGroups.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRescan}
                disabled={duplicate.isScanning}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Rescan
              </Button>
            )}
        </div>
      </div>

      <DuplicateCard onGoHome={() => router.push('/')} />
    </div>
  );
}
