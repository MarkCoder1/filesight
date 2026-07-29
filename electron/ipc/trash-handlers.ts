import { ipcMain, type IpcMainInvokeEvent } from 'electron';

import { saveCleanup } from '../database/cleanupRepository';
import { executeCleanup } from '../cleanup/cleanupService';

export function registerTrashHandlers(): void {
  ipcMain.handle(
    'trash:preview',
    async (_event, { files }: { files: { path: string; name: string; size: number }[] }) => {
      const totalSize = files.reduce((s, f) => s + f.size, 0);
      return {
        filesCount: files.length,
        totalSize,
        files: files.map((f) => ({ path: f.path, name: f.name })),
      };
    },
  );

  ipcMain.handle(
    'trash:move',
    async (
      event: IpcMainInvokeEvent,
      { files }: { files: { path: string; name: string; size: number }[] },
    ) => {
      const result = await executeCleanup(files, (current, total, currentFile) => {
        event.sender.send('trash:progress', {
          current,
          total,
          currentFile,
          percentage: Math.round((current / total) * 100),
        });
      });

      // Auto-save to history
      if (result.successCount > 0) {
        const totalSize = files.reduce((s, f) => s + f.size, 0);
        saveCleanup({
          date: new Date().toISOString(),
          filesMoved: result.successCount,
          totalFiles: files.length,
          spaceRecovered: totalSize,
          files: files.map((f) => f.path),
        });
      }

      return result;
    },
  );
}
