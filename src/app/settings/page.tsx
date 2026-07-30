'use client';

import { FolderOpen, Info, Layers, Monitor, RefreshCw, ScanLine } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useSyncExternalStore } from 'react';

import { DangerZone } from '@/components/settings/DangerZone';
import { FolderPicker } from '@/components/settings/FolderPicker';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { ThresholdInput } from '@/components/settings/ThresholdInput';
import { ToggleSetting } from '@/components/settings/ToggleSetting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistory } from '@/hooks/use-history';
import { useSettings } from '@/hooks/use-settings';
import { formatBytes } from '@/lib/utils';

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function ThemeSetting({
  value,
  onChange,
}: {
  value: 'light' | 'dark' | 'system';
  onChange: (v: 'light' | 'dark' | 'system') => void;
}) {
  const { setTheme } = useTheme();
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <ThemeSelector
      value={value}
      onChange={(v) => {
        onChange(v);
        setTheme(v);
      }}
    />
  );
}

export default function SettingsPage() {
  const { settings, settingsLoading, saved, updateSetting, resetSetting, selectFolder } =
    useSettings();

  const { resetHistory } = useHistory();

  const handleClearHistory = useCallback(async () => {
    await resetHistory();
  }, [resetHistory]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your preferences</p>
        </div>
        {saved && (
          <span className="text-xs text-green-600 dark:text-green-400">
            Settings saved successfully.
          </span>
        )}
      </div>

      {settingsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ) : (
        <>
          {/* General */}
          <SettingsSection
            icon={FolderOpen}
            title="General"
            description="Basic application preferences"
          >
            <FolderPicker selectedPath={settings.defaultScanFolder} onSelect={selectFolder} />
          </SettingsSection>

          {/* Scanning */}
          <SettingsSection
            icon={ScanLine}
            title="Scanning"
            description="Control how files are scanned"
          >
            <div className="space-y-5">
              <ToggleSetting
                label="Include Hidden Files"
                description='Show files beginning with "."'
                checked={settings.includeHiddenFiles}
                onCheckedChange={(v) => updateSetting({ includeHiddenFiles: v })}
              />
              <Separator />
              <ToggleSetting
                label="Follow Symbolic Links"
                description="Prevent scanning linked folders"
                checked={settings.followSymbolicLinks}
                onCheckedChange={(v) => updateSetting({ followSymbolicLinks: v })}
              />
              <Separator />
              <ThresholdInput
                label="Scan Depth"
                description="Maximum folder depth to scan"
                value={settings.scanDepth}
                unit="folders"
                min={1}
                max={50}
                allowNull
                nullLabel="Unlimited"
                onChange={(v) => updateSetting({ scanDepth: v })}
              />
              <Separator />
              <ThresholdInput
                label="Large File Warning"
                description={`Files larger than ${formatBytes(settings.showLargeFilesThreshold)} trigger warnings`}
                value={Math.round(settings.showLargeFilesThreshold / (1024 * 1024 * 1024))}
                unit="GB"
                min={1}
                max={100}
                onChange={(v) =>
                  v !== null && updateSetting({ showLargeFilesThreshold: v * 1024 * 1024 * 1024 })
                }
              />
              <Separator />
              <ThresholdInput
                label="Old File Warning"
                description={`Files older than ${settings.showOldFilesThresholdDays} days trigger warnings`}
                value={settings.showOldFilesThresholdDays}
                unit="days"
                min={1}
                max={3650}
                onChange={(v) => v !== null && updateSetting({ showOldFilesThresholdDays: v })}
              />
            </div>
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection
            icon={Monitor}
            title="Appearance"
            description="Customize your appearance"
          >
            <ThemeSetting value={settings.theme} onChange={(v) => updateSetting({ theme: v })} />
          </SettingsSection>

          {/* Privacy */}
          <DangerZone onClearHistory={handleClearHistory} />

          {/* Reset */}
          <SettingsSection
            icon={Layers}
            title="Reset Settings"
            description="Restore all preferences to defaults"
          >
            <Button variant="outline" size="sm" onClick={resetSetting}>
              Reset to Defaults
            </Button>
          </SettingsSection>

          {/* Onboarding */}
          <SettingsSection
            icon={RefreshCw}
            title="Onboarding"
            description="The first-launch introduction"
          >
            <Button
              variant="outline"
              size="sm"
              className="hover:cursor-pointer"
              onClick={() => updateSetting({ hasCompletedOnboarding: false })}
            >
              Replay Onboarding
            </Button>
          </SettingsSection>

          <Separator />

          {/* About */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">About FileSight</CardTitle>
                  <CardDescription>Understand your files. Reclaim your space.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Version 1.0.0</p>
                <p>Open Source (MIT)</p>
                <p>Built with Electron + Next.js</p>
                <p>
                  <a
                    href="https://github.com/MarkCoder1/filesight"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    View on GitHub
                  </a>
                </p>
                <p className="pt-2 text-xs">
                  Everything runs locally. No data ever leaves your computer.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
