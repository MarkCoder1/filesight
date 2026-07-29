export interface ScannerConfig {
  includeHidden?: boolean;
  maxDepth?: number;
  followSymlinks?: boolean;
}

export interface ScanProgress {
  phase: 'counting' | 'scanning';
  scannedFiles: number;
  totalFiles: number;
  currentFile: string | null;
  percentage: number;
}

export interface ScannerError {
  path: string;
  message: string;
  code: string;
}

export const DEFAULT_SCANNER_CONFIG: ScannerConfig = {
  includeHidden: false,
  maxDepth: 50,
  followSymlinks: false,
};

export const SYSTEM_FILES = new Set([
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  '.localized',
  'Icon\r',
]);
