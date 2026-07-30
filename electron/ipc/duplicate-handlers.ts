import { ipcMain, type IpcMainInvokeEvent } from 'electron';

import { scanDuplicates } from '../services/duplicateFinder/duplicateEngine';
import {
  recommendBestFile,
  saveDuplicateCleanupRecord,
  trashDuplicateFiles,
} from '../services/duplicateFinder/cleanupManager';

let currentAbortController: AbortController | null = null;

export function registerDuplicateHandlers(): void {
  ipcMain.handle(
    'duplicates:start',
    async (
      event: IpcMainInvokeEvent,
      { files }: { files: { path: string; name: string; size: number; modifiedAt: Date }[] },
    ) => {
      if (currentAbortController) {
        currentAbortController.abort();
      }

      const abortController = new AbortController();
      currentAbortController = abortController;

      const onCancel = () => {
        abortController.abort();
        currentAbortController = null;
      };
      ipcMain.on('duplicates:cancel', onCancel);

      try {
        const result = await scanDuplicates(
          files,
          (progress) => {
            event.sender.send('duplicates:progress', progress);
          },
          abortController.signal,
        );

        if (currentAbortController === abortController) {
          currentAbortController = null;
        }
        ipcMain.removeListener('duplicates:cancel', onCancel);
        return result;
      } catch (err) {
        if (currentAbortController === abortController) {
          currentAbortController = null;
        }
        ipcMain.removeListener('duplicates:cancel', onCancel);
        const message = err instanceof Error ? err.message : 'Duplicate scan failed';
        throw new Error(message);
      }
    },
  );

  ipcMain.handle(
    'duplicates:delete',
    async (
      event: IpcMainInvokeEvent,
      { files, totalSize }: { files: { path: string; name: string }[]; totalSize: number },
    ) => {
      const result = await trashDuplicateFiles(files, (current, total, currentFile) => {
        event.sender.send('duplicates:delete-progress', { current, total, currentFile });
      });

      if (result.successCount > 0) {
        await saveDuplicateCleanupRecord({
          files: files.map((f) => ({ ...f, size: totalSize / files.length })),
          successCount: result.successCount,
          totalSize,
        });
      }

      return result;
    },
  );

  ipcMain.handle(
    'duplicates:recommend',
    async (
      _event,
      {
        files,
      }: {
        files: Array<{
          path: string;
          name: string;
          size: number;
          modifiedAt: Date;
          resolution?: { width: number; height: number };
          matchType?: string;
        }>;
      },
    ) => {
      return recommendBestFile(files);
    },
  );
}
