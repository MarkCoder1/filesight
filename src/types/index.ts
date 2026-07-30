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
  'old-installers' | 'stale-archives' | 'large-files' | 'duplicate-candidates';

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

export type MatchType =
  'hash-exact' | 'filename-similar' | 'perceptual' | 'document-similar' | 'video-similar';

export interface DuplicateFileInfo {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  hash: string;
  confidence?: ConfidenceLevel;
  matchType?: MatchType;
  similarity?: number;
  resolution?: { width: number; height: number } | null;
  isRecommended?: boolean;
}

export interface DuplicateGroup {
  id: string;
  hash: string;
  files: DuplicateFileInfo[];
  totalSize: number;
  wastedSpace: number;
  confidence?: ConfidenceLevel;
  matchType?: MatchType;
  detectionLevel?: 1 | 2 | 3;
}

export type ScanStage =
  'metadata' | 'filename' | 'hashing' | 'perceptual' | 'document' | 'video' | 'recommending';

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
  categories?: {
    exact: number;
    similarImages: number;
    similarDocuments: number;
    filename: number;
  };
}

export interface DuplicateDeleteResult {
  successCount: number;
  failureCount: number;
  results: Array<{ path: string; name: string; success: boolean; error?: string }>;
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

export type PreviewType = 'image' | 'text' | 'pdf' | 'audio' | 'video' | 'unsupported';

export interface ReadTextFileResult {
  content: string;
  truncated: boolean;
}

export interface ReadFileBase64Result {
  data: string | null;
  mime: string;
  tooLarge: boolean;
  size: number;
}

export interface FileStat {
  size: number;
  modifiedAt: string;
  createdAt: string;
  isDirectory: boolean;
  isFile: boolean;
}

export type OrgCategory =
  'images' | 'documents' | 'videos' | 'audio' | 'archives' | 'installers' | 'unknown';

export interface OrgCategoryInfo {
  category: OrgCategory;
  label: string;
  files: Array<{ path: string; name: string; size: number }>;
  fileCount: number;
  totalSize: number;
  suggestedPath: string;
}

export interface OrgPlan {
  id: string;
  sourceFolder: string;
  categories: OrgCategoryInfo[];
  totalFiles: number;
  totalSize: number;
  createdAt: string;
}

export interface OrgFileMove {
  id: string;
  originalPath: string;
  newPath: string;
  fileName: string;
  category: OrgCategory;
  size: number;
  status: 'pending' | 'moved' | 'skipped' | 'conflict';
  resolvedPath?: string;
}

export interface OrgMoveResult {
  successCount: number;
  skipCount: number;
  conflictCount: number;
  totalSize: number;
  moves: OrgFileMove[];
}

export interface OrgUndoRecord {
  id: string;
  date: string;
  planId: string;
  label: string;
  moves: Array<{ originalPath: string; newPath: string }>;
  totalFiles: number;
  totalSize: number;
}

export function getPreviewType(extension: string): PreviewType {
  const ext = extension.toLowerCase().replace(/^\./, '');
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image';
  if (
    ['txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'xml', 'csv', 'log'].includes(
      ext,
    )
  )
    return 'text';
  if (ext === 'pdf') return 'pdf';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)) return 'video';
  return 'unsupported';
}

export interface ElectronAPI {
  startScan: (dirPath: string) => Promise<ScanResult>;
  onScanProgress: (callback: (progress: ScanProgress) => void) => () => void;
  onScanComplete: (
    callback: (result: { path: string; totalFiles: number; totalSize: number }) => void,
  ) => () => void;
  runAnalysis: (files: FileEntry[]) => Promise<AnalysisResult>;
  trashPreview: (
    files: { path: string; name: string; size: number }[],
  ) => Promise<{ filesCount: number; totalSize: number; files: { path: string; name: string }[] }>;
  moveToTrash: (files: { path: string; name: string; size: number }[]) => Promise<TrashResult>;
  onTrashProgress: (callback: (progress: TrashProgress) => void) => () => void;
  findDuplicates: (
    files: { path: string; name: string; size: number; modifiedAt: Date }[],
  ) => Promise<DuplicateScanResult>;
  cancelDuplicateScan: () => void;
  onDuplicateProgress: (callback: (progress: DuplicateScanProgress) => void) => () => void;
  deleteDuplicates: (
    files: { path: string; name: string }[],
    totalSize: number,
  ) => Promise<DuplicateDeleteResult>;
  onDuplicateDeleteProgress: (
    callback: (progress: { current: number; total: number; currentFile: string }) => void,
  ) => () => void;
  recommendDuplicates: (
    files: Array<{
      path: string;
      name: string;
      size: number;
      modifiedAt: Date;
      resolution?: { width: number; height: number };
      matchType?: string;
    }>,
  ) => Promise<{ path: string } | null>;
  getScanHistory: (
    limit?: number,
    offset?: number,
  ) => Promise<{ scans: ScanHistoryRecord[]; total: number }>;
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

  readTextFile: (path: string) => Promise<ReadTextFileResult>;
  readImageFile: (path: string) => Promise<string>;
  readFileBase64: (path: string) => Promise<ReadFileBase64Result>;
  fileExists: (path: string) => Promise<boolean>;
  openInFolder: (path: string) => Promise<void>;
  copyToClipboard: (text: string) => Promise<void>;
  fileStat: (path: string) => Promise<FileStat>;

  generateOrgPlan: (
    files: Array<{ path: string; name: string; size: number; extension: string }>,
    sourceFolder: string,
  ) => Promise<OrgPlan>;
  executeOrgMoves: (
    operations: Array<{
      id: string;
      originalPath: string;
      newPath: string;
      fileName: string;
      size: number;
      category: string;
    }>,
  ) => Promise<OrgMoveResult>;
  getOrgHistory: () => Promise<OrgUndoRecord[]>;
  undoOrgMoves: (
    recordId: string,
    moves: Array<{ originalPath: string; newPath: string }>,
  ) => Promise<{ undoneCount: number; failedCount: number }>;
}
