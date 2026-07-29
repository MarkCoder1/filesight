import type { FileEntry } from '../../src/types';
import type { AnalysisResult } from './types';

import { analyzeCategories } from './categoryAnalyzer';
import { findLargestFiles } from './largeFilesAnalyzer';
import { findOldFiles } from './oldFilesAnalyzer';
import { analyzeStorage } from './storageAnalyzer';
import { generateSuggestions } from './suggestionEngine';

export type { AnalysisResult };
export {
  analyzeCategories,
  analyzeStorage,
  findLargestFiles,
  findOldFiles,
  generateSuggestions,
};

export function analyzeFiles(files: FileEntry[]): AnalysisResult {
  return {
    storageStats: analyzeStorage(files),
    categories: analyzeCategories(files),
    largestFiles: findLargestFiles(files, 10),
    oldFiles: findOldFiles(files),
    suggestions: generateSuggestions(files),
  };
}
