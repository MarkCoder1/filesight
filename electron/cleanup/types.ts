export interface CleanupProgress {
  current: number;
  total: number;
  currentFile: string;
  percentage: number;
}

export interface CleanupFileResult {
  path: string;
  name: string;
  success: boolean;
  error?: string;
}

export interface CleanupResult {
  successCount: number;
  failureCount: number;
  totalSize: number;
  results: CleanupFileResult[];
}
