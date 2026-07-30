import { ipcMain, type IpcMainInvokeEvent } from 'electron';

import { buildScanResult, scanDuplicates } from '../duplicate-engine';

let currentAbortController: AbortController | null = null;

export function registerDuplicateHandlers(): void {
  ipcMain.handle(
    'duplicates:start',
    async (
      event: IpcMainInvokeEvent,
      {
        files,
      }: {
        files: { path: string; name: string; size: number; modifiedAt: Date }[];
      },
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
        const groups = await scanDuplicates(files, (progress) => {
          event.sender.send('duplicates:progress', progress);
        }, abortController.signal);

        if (currentAbortController === abortController) {
          currentAbortController = null;
        }
        ipcMain.removeListener('duplicates:cancel', onCancel);
        return buildScanResult(groups);
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
}
