import { ipcMain, app, shell } from 'electron';

import { registerAnalyzeHandlers } from './analyze-handlers';
import { registerDuplicateHandlers } from './duplicate-handlers';
import { registerHistoryHandlers } from './history-handlers';
import { registerScanHandlers } from './scan-handlers';
import { registerSettingsHandlers } from './settings-handlers';
import { registerTrashHandlers } from './trash-handlers';

export function registerIpcHandlers(): void {
  registerScanHandlers();
  registerTrashHandlers();
  registerAnalyzeHandlers();
  registerDuplicateHandlers();
  registerHistoryHandlers();
  registerSettingsHandlers();

  ipcMain.handle('env:home', () => {
    return app.getPath('home');
  });

  ipcMain.handle('app:version', () => {
    return app.getVersion();
  });

  ipcMain.handle('fs:reveal', (_event, { path }: { path: string }) => {
    shell.showItemInFolder(path);
  });

  ipcMain.handle('fs:open', (_event, { path }: { path: string }) => {
    shell.openPath(path);
  });
}
