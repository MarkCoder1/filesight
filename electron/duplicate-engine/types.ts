export type ConfidenceLevel = 'exact' | 'strong' | 'similar';

export type MatchType = 'hash-exact' | 'filename-similar' | 'perceptual';

export interface DuplicateFileInfo {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  hash: string;
  confidence: ConfidenceLevel;
  matchType: MatchType;
}

export interface DuplicateGroup {
  id: string;
  hash: string;
  files: DuplicateFileInfo[];
  totalSize: number;
  wastedSpace: number;
  confidence: ConfidenceLevel;
  matchType: MatchType;
}

export type ScanStage = 'metadata' | 'filename' | 'hashing' | 'perceptual';

export interface DuplicateScanProgress {
  stage: ScanStage;
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

export interface ScanFile {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  extension: string;
}
