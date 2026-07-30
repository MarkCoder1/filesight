export interface ScanFile {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  extension: string;
}

export interface DuplicateFileInfo {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  hash: string;
  confidence: 'exact' | 'strong' | 'similar';
  matchType:
    'hash-exact' | 'filename-similar' | 'perceptual' | 'document-similar' | 'video-similar';
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
  confidence: 'exact' | 'strong' | 'similar';
  matchType:
    'hash-exact' | 'filename-similar' | 'perceptual' | 'document-similar' | 'video-similar';
  detectionLevel: 1 | 2 | 3;
}

export type ScanStage =
  'metadata' | 'filename' | 'hashing' | 'perceptual' | 'document' | 'video' | 'recommending';

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
  categories: {
    exact: number;
    similarImages: number;
    similarDocuments: number;
    filename: number;
  };
}

export type DocumentTextExtractor = (filePath: string, extension: string) => Promise<string | null>;
