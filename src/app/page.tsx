'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FeatureCards } from '@/components/home/feature-cards';
import { HeroSection } from '@/components/home/hero-section';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ErrorMessage } from '@/components/scan/error-message';
import { ScanCompleteCard } from '@/components/scan/scan-complete-card';
import { ScanProgress } from '@/components/scan/scan-progress';
import { useIpc } from '@/hooks/use-ipc';
import { useScan } from '@/hooks/use-scan';
import { useScanStore } from '@/hooks/use-scan-store';
import { useSettings } from '@/hooks/use-settings';

export default function HomePage() {
  const router = useRouter();
  const { state, scan, reset } = useScan();
  const { setLastResult } = useScanStore();
  const { settings, settingsLoaded, updateSetting, selectFolder } = useSettings();
  const { getHomeDirectory } = useIpc();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const homeDirRef = useRef<string>('');

  useEffect(() => {
    getHomeDirectory().then((home) => {
      homeDirRef.current = home;
    });
  }, [getHomeDirectory]);

  useEffect(() => {
    if (settingsLoaded && !settings.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [settingsLoaded, settings.hasCompletedOnboarding]);

  const handleScanFolder = useCallback(async (dirPath: string) => {
    reset();
    setSelectedFolder(null);
    const result = await scan(dirPath);
    if (result) {
      setLastResult(result);
    }
  }, [reset, scan, setLastResult]);

  const handleScanDownloads = useCallback(() => {
    const downloadsPath = `${homeDirRef.current}/Downloads`;
    handleScanFolder(downloadsPath);
  }, [handleScanFolder]);

  const handleChooseFolder = useCallback(async () => {
    const folder = await selectFolder();
    if (folder) {
      setSelectedFolder(folder);
    }
  }, [selectFolder]);

  const handleScanSelectedFolder = useCallback(async () => {
    if (selectedFolder) {
      handleScanFolder(selectedFolder);
    }
  }, [selectedFolder, handleScanFolder]);

  const handleRetry = useCallback(() => {
    if (selectedFolder) {
      handleScanFolder(selectedFolder);
    } else {
      const downloadsPath = `${homeDirRef.current}/Downloads`;
      handleScanFolder(downloadsPath);
    }
  }, [selectedFolder, handleScanFolder]);

  const handleViewDashboard = () => {
    router.push('/dashboard');
  };

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    updateSetting({ hasCompletedOnboarding: true });
  }, [updateSetting]);

  const showIdle = state.status === 'idle';

  return (
    <>
      {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}

      <div className="flex flex-col">
        <HeroSection
          onScanDownloads={handleScanDownloads}
          onChooseFolder={selectedFolder ? handleScanSelectedFolder : handleChooseFolder}
          isScanning={
            state.status === 'counting' || state.status === 'scanning'
          }
          selectedFolder={selectedFolder}
        />

        {state.status === 'counting' && (
          <div className="mx-auto mb-8 w-full max-w-sm">
            <ScanProgress
              progress={{
                phase: 'counting',
                scannedFiles: 0,
                totalFiles: 0,
                currentFile: null,
                percentage: 0,
              }}
            />
          </div>
        )}

        {state.status === 'scanning' && (
          <div className="mx-auto mb-8 w-full max-w-sm">
            <ScanProgress progress={state.progress} />
          </div>
        )}

        {state.status === 'error' && (
          <div className="mx-auto mb-8 w-full max-w-sm">
            <ErrorMessage message={state.message} onRetry={handleRetry} />
          </div>
        )}

        {state.status === 'complete' && state.result && (
          <div className="mx-auto mb-8 w-full max-w-sm">
            <ScanCompleteCard
              result={state.result}
              onViewDashboard={handleViewDashboard}
              onRescan={handleRetry}
            />
          </div>
        )}

        {showIdle && (
          <>
            {!selectedFolder && <FeatureCards />}
          </>
        )}
      </div>
    </>
  );
}
