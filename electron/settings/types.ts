export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  theme: ThemeMode;
  defaultScanFolder: string;
  includeHiddenFiles: boolean;
  followSymbolicLinks: boolean;
  scanDepth: number | null;
  showLargeFilesThreshold: number;
  showOldFilesThresholdDays: number;
  enableScanHistory: boolean;
  hasCompletedOnboarding: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  defaultScanFolder: '',
  includeHiddenFiles: false,
  followSymbolicLinks: false,
  scanDepth: null,
  showLargeFilesThreshold: 2 * 1024 * 1024 * 1024,
  showOldFilesThresholdDays: 180,
  enableScanHistory: true,
  hasCompletedOnboarding: false,
};
