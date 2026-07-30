export type FileCategory =
  | 'images'
  | 'videos'
  | 'documents'
  | 'archives'
  | 'installers'
  | 'applications'
  | 'audio'
  | 'code'
  | 'other';

export interface FileEntry {
  id: string;
  name: string;
  path: string;
  extension: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  isDirectory: boolean;
  category: FileCategory;
}

export interface ScanProgress {
  phase: 'counting' | 'scanning';
  scannedFiles: number;
  totalFiles: number;
  currentFile: string | null;
  percentage: number;
}

export interface ScanResult {
  path: string;
  files: FileEntry[];
  totalFiles: number;
  totalSize: number;
  scannedAt: Date;
  errors: ScanError[];
}

export interface ScanError {
  path: string;
  message: string;
}

export interface StorageByCategory {
  category: FileCategory;
  count: number;
  totalSize: number;
  percentage: number;
}

export interface Analysis {
  totalFiles: number;
  totalSize: number;
  largestFiles: FileEntry[];
  oldestFiles: FileEntry[];
  storageByCategory: StorageByCategory[];
  topExtensions: { extension: string; count: number; totalSize: number }[];
  oldestFile: FileEntry | null;
  largestFile: FileEntry | null;
}

export type SuggestionType =
  | 'old-installers'
  | 'stale-archives'
  | 'large-files'
  | 'duplicate-candidates';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  fileCount: number;
  totalSize: number;
  filePaths: string[];
}

export interface TrashFileResult {
  path: string;
  name: string;
  success: boolean;
  error?: string;
}

export interface TrashResult {
  successCount: number;
  failureCount: number;
  totalSize: number;
  results: TrashFileResult[];
}

export interface TrashProgress {
  current: number;
  total: number;
  currentFile: string;
  percentage: number;
}

export interface ScanConfig {
  path: string;
  includeHidden?: boolean;
  maxDepth?: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  largestFile: { name: string; size: number } | null;
  smallestFile: { name: string; size: number } | null;
}

export interface OldFilesResult {
  olderThan6Months: number;
  olderThan1Year: number;
  olderThan2Years: number;
  files: { name: string; path: string; size: number; ageDays: number }[];
}

export interface AnalysisSuggestion {
  id: string;
  type: 'old-installers' | 'large-files' | 'stale-archives' | 'duplicate-candidates';
  title: string;
  description: string;
  detail: string;
  fileCount: number;
  totalSize: number;
  severity: 'low' | 'medium' | 'high';
  files: { name: string; path: string; size: number }[];
}

export interface AnalysisResult {
  storageStats: StorageStats;
  categories: StorageByCategory[];
  largestFiles: { name: string; path: string; size: number; category: FileCategory }[];
  oldFiles: OldFilesResult;
  suggestions: AnalysisSuggestion[];
}

export type ConfidenceLevel = 'exact' | 'strong' | 'similar';

export type MatchType = 'hash-exact' | 'filename-similar' | 'perceptual';

export interface DuplicateFileInfo {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  hash: string;
  confidence?: ConfidenceLevel;
  matchType?: MatchType;
}

export interface DuplicateGroup {
  id: string;
  hash: string;
  files: DuplicateFileInfo[];
  totalSize: number;
  wastedSpace: number;
  confidence?: ConfidenceLevel;
  matchType?: MatchType;
}

export type ScanStage = 'metadata' | 'filename' | 'hashing' | 'perceptual';

export interface DuplicateScanProgress {
  stage?: ScanStage;
  currentFile: string;
  processedFiles: number;
  totalFiles: number;
  percentage: number;
}

export interface DuplicateScanResult {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  wastedSpace: number;
}

export interface ScanHistoryRecord {
  id: string;
  date: string;
  folderPath: string;
  totalFiles: number;
  totalSize: number;
  categories: { category: string; count: number; totalSize: number; percentage: number }[];
  largestFiles: { name: string; path: string; size: number; category: string }[];
  duplicateSize: number;
  suggestionCount: number;
}

export interface CleanupHistoryRecord {
  id: string;
  date: string;
  filesMoved: number;
  totalFiles: number;
  spaceRecovered: number;
  files: string[];
}

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

export const DEFAULT_USER_SETTINGS: UserSettings = {
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

export interface ScanComparison {
  scan1: ScanHistoryRecord;
  scan2: ScanHistoryRecord;
  storageDifference: number;
  fileDifference: number;
  categoryChanges: { category: string; countDiff: number; sizeDiff: number }[];
}

export interface ElectronAPI {
  startScan: (dirPath: string) => Promise<ScanResult>;
  onScanProgress: (callback: (progress: ScanProgress) => void) => () => void;
  onScanComplete: (callback: (result: { path: string; totalFiles: number; totalSize: number }) => void) => () => void;
  runAnalysis: (files: FileEntry[]) => Promise<AnalysisResult>;
  trashPreview: (files: { path: string; name: string; size: number }[]) => Promise<{ filesCount: number; totalSize: number; files: { path: string; name: string }[] }>;
  moveToTrash: (files: { path: string; name: string; size: number }[]) => Promise<TrashResult>;
  onTrashProgress: (callback: (progress: TrashProgress) => void) => () => void;
  findDuplicates: (files: { path: string; name: string; size: number; modifiedAt: Date }[]) => Promise<DuplicateScanResult>;
  cancelDuplicateScan: () => void;
  onDuplicateProgress: (callback: (progress: DuplicateScanProgress) => void) => () => void;
  getScanHistory: (limit?: number, offset?: number) => Promise<{ scans: ScanHistoryRecord[]; total: number }>;
  getScanDetail: (id: string) => Promise<ScanHistoryRecord | null>;
  getLatestScan: () => Promise<ScanHistoryRecord | null>;
  getLatestCleanup: () => Promise<CleanupHistoryRecord | null>;
  getTotalRecovered: () => Promise<number>;
  compareScans: (scanId1: string, scanId2: string) => Promise<ScanComparison | null>;
  revealInFinder: (filePath: string) => Promise<void>;
  openFile: (filePath: string) => Promise<void>;
  getHomeDirectory: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  getSettings: () => Promise<UserSettings>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<UserSettings>;
  resetSettings: () => Promise<UserSettings>;
  selectFolder: () => Promise<string | null>;
  resetHistory: () => Promise<void>;
}
