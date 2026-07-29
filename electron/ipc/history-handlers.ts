import { ipcMain } from 'electron';

import {
  getCleanupHistory,
  getLatestCleanup,
  getTotalSpaceRecovered,
  saveCleanup,
} from '../database/cleanupRepository';
import { resetDatabase } from '../database/database';
import {
  compareScans,
  getLatestScan,
  getScanById,
  getScanHistory,
  saveScan,
} from '../database/scanRepository';

export function registerHistoryHandlers(): void {
  ipcMain.handle('history:save-scan', async (_event, { record }) => {
    return saveScan(record);
  });

  ipcMain.handle('history:get-scans', async (_event, { limit, offset }) => {
    return getScanHistory(limit, offset);
  });

  ipcMain.handle('history:get-scan', async (_event, { id }) => {
    return getScanById(id);
  });

  ipcMain.handle('history:latest-scan', async () => {
    return getLatestScan();
  });

  ipcMain.handle('history:compare', async (_event, { scanId1, scanId2 }) => {
    return compareScans(scanId1, scanId2);
  });

  ipcMain.handle('history:save-cleanup', async (_event, { record }) => {
    return saveCleanup(record);
  });

  ipcMain.handle('history:get-cleanups', async (_event, { limit, offset }) => {
    return getCleanupHistory(limit, offset);
  });

  ipcMain.handle('history:latest-cleanup', async () => {
    return getLatestCleanup();
  });

  ipcMain.handle('history:total-recovered', async () => {
    return getTotalSpaceRecovered();
  });

  ipcMain.handle('history:reset', async () => {
    await resetDatabase();
  });
}
