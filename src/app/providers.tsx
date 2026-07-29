'use client';

import { ThemeProvider } from 'next-themes';

import { AppShell } from '@/components/layout/app-shell';
import { ScanStoreProvider } from '@/hooks/use-scan-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ScanStoreProvider>
        <AppShell>{children}</AppShell>
      </ScanStoreProvider>
    </ThemeProvider>
  );
}
