'use client';

import { Suspense } from 'react';

import { HistoryContent } from './content';

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
