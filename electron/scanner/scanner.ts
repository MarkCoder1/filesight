import type { FileEntry, ScanResult } from '../../src/types';

import { collectFiles, countFiles } from './fileCollector';
import { getFileInfo } from './fileMetadata';
import type { ScanProgress, ScannerConfig, ScannerError } from './types';
import { DEFAULT_SCANNER_CONFIG } from './types';

export type ProgressCallback = (progress: ScanProgress) => void;

export async function scanDirectory(
  dirPath: string,
  config: ScannerConfig = DEFAULT_SCANNER_CONFIG,
  onProgress?: ProgressCallback,
): Promise<ScanResult> {
  const mergedConfig = { ...DEFAULT_SCANNER_CONFIG, ...config };

  onProgress?.({
    phase: 'counting',
    scannedFiles: 0,
    totalFiles: 0,
    currentFile: null,
    percentage: 0,
  });

  const totalFiles = await countFiles(dirPath, mergedConfig);

  onProgress?.({
    phase: 'scanning',
    scannedFiles: 0,
    totalFiles,
    currentFile: null,
    percentage: 0,
  });

  const { files: collectedFiles, errors: collectorErrors } = await collectFiles(
    dirPath,
    mergedConfig,
  );

  const files: FileEntry[] = [];
  const scanErrors: ScannerError[] = [...collectorErrors];

  for (let i = 0; i < collectedFiles.length; i++) {
    const collected = collectedFiles[i];
    const fileInfo = await getFileInfo(collected.entry);

    if (fileInfo) {
      files.push(fileInfo);
    }

    if (totalFiles > 0) {
      onProgress?.({
        phase: 'scanning',
        scannedFiles: i + 1,
        totalFiles,
        currentFile: collected.entry.name,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
      });
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return {
    path: dirPath,
    files,
    totalFiles: files.length,
    totalSize,
    scannedAt: new Date(),
    errors: scanErrors,
  };
}
