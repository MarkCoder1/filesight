import type { FileCategory } from '../../src/types';

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  largestFile: { name: string; size: number } | null;
  smallestFile: { name: string; size: number } | null;
}

export interface CategoryStats {
  category: FileCategory;
  count: number;
  totalSize: number;
  percentage: number;
  files: string[];
}

export interface OldFilesResult {
  olderThan6Months: number;
  olderThan1Year: number;
  olderThan2Years: number;
  files: { name: string; path: string; size: number; ageDays: number }[];
}

export interface Suggestion {
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
  categories: CategoryStats[];
  largestFiles: { name: string; path: string; size: number; category: FileCategory }[];
  oldFiles: OldFilesResult;
  suggestions: Suggestion[];
}
