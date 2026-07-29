export interface DuplicateFileInfo {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  hash: string;
}

export interface DuplicateGroup {
  id: string;
  hash: string;
  files: DuplicateFileInfo[];
  totalSize: number;
  wastedSpace: number;
}

export interface DuplicateScanProgress {
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
