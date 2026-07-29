import { ipcMain, type IpcMainInvokeEvent } from 'electron';

import { saveScan } from '../database/scanRepository';
import { scanDirectory } from '../scanner/scanner';
import type { ScannerConfig } from '../scanner/types';

export function registerScanHandlers(): void {
  ipcMain.handle(
    'scan:start',
    async (
      event: IpcMainInvokeEvent,
      { path: dirPath, config }: { path: string; config?: ScannerConfig },
    ) => {
      const result = await scanDirectory(dirPath, config, (progress) => {
        event.sender.send('scan:progress', progress);
      });

      event.sender.send('scan:complete', {
        path: result.path,
        totalFiles: result.totalFiles,
        totalSize: result.totalSize,
      });

      // Auto-save to history
      const categoryMap = new Map<string, { count: number; totalSize: number }>();
      for (const file of result.files) {
        const existing = categoryMap.get(file.category);
        if (existing) {
          existing.count++;
          existing.totalSize += file.size;
        } else {
          categoryMap.set(file.category, { count: 1, totalSize: file.size });
        }
      }

      const totalSize = result.totalSize || 1;
      const categories = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        count: stats.count,
        totalSize: stats.totalSize,
        percentage: Math.round((stats.totalSize / totalSize) * 100),
      }));

      const largestFiles = result.files
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .map((f) => ({
          name: f.name,
          path: f.path,
          size: f.size,
          category: f.category,
        }));

      saveScan({
        date: new Date().toISOString(),
        folderPath: result.path,
        totalFiles: result.totalFiles,
        totalSize: result.totalSize,
        categories,
        largestFiles,
        duplicateSize: 0,
        suggestionCount: 0,
      });

      return result;
    },
  );
}
