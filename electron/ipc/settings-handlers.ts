import { dialog, ipcMain } from 'electron';

import { getSettings, restoreDefaults, updateSettings } from '../settings/settingsService';
import type { UserSettings } from '../settings/types';

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async () => {
    return getSettings();
  });

  ipcMain.handle('settings:update', async (_event, partial: Partial<UserSettings>) => {
    return updateSettings(partial);
  });

  ipcMain.handle('settings:reset', async () => {
    return restoreDefaults();
  });

  ipcMain.handle('settings:select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });
}
