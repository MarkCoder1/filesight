export interface StoredCategoryStats {
  category: string;
  count: number;
  totalSize: number;
  percentage: number;
}

export interface StoredFileInfo {
  name: string;
  path: string;
  size: number;
  category: string;
}

export interface ScanRecord {
  id: string;
  date: string;
  folderPath: string;
  totalFiles: number;
  totalSize: number;
  categories: StoredCategoryStats[];
  largestFiles: StoredFileInfo[];
  duplicateSize: number;
  suggestionCount: number;
}

export interface CleanupRecord {
  id: string;
  date: string;
  filesMoved: number;
  totalFiles: number;
  spaceRecovered: number;
  files: string[];
}

export interface StoredData {
  scans: ScanRecord[];
  cleanups: CleanupRecord[];
}
