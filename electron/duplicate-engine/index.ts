export { buildScanResult, scanDuplicates } from './scanner';
export { calculateChunkHash, calculateFileHash, validatePath } from './hasher';
export { areFilenamesSimilar, normalizeFileName } from './filenameMatcher';
export { areImagesSimilar, computeDHash, hammingDistance, isImageFile } from './imageHash';
export type {
  ConfidenceLevel,
  DuplicateFileInfo,
  DuplicateGroup,
  DuplicateScanProgress,
  DuplicateScanResult,
  MatchType,
  ScanStage,
} from './types';
