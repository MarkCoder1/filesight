import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  startScan: (dirPath: string) =>
    ipcRenderer.invoke('scan:start', { path: dirPath }),

  onScanProgress: (callback: (progress: unknown) => void) => {
    const handler = (_event: unknown, progress: unknown) => callback(progress);
    ipcRenderer.on('scan:progress', handler);
    return () => {
      ipcRenderer.removeListener('scan:progress', handler);
    };
  },

  onScanComplete: (callback: (result: unknown) => void) => {
    const handler = (_event: unknown, result: unknown) => callback(result);
    ipcRenderer.on('scan:complete', handler);
    return () => {
      ipcRenderer.removeListener('scan:complete', handler);
    };
  },

  runAnalysis: (files: unknown) =>
    ipcRenderer.invoke('analyze:run', { files }),

  trashPreview: (files: { path: string; name: string; size: number }[]) =>
    ipcRenderer.invoke('trash:preview', { files }),

  moveToTrash: (files: { path: string; name: string; size: number }[]) =>
    ipcRenderer.invoke('trash:move', { files }),

  onTrashProgress: (callback: (progress: unknown) => void) => {
    const handler = (_event: unknown, progress: unknown) => callback(progress);
    ipcRenderer.on('trash:progress', handler);
    return () => {
      ipcRenderer.removeListener('trash:progress', handler);
    };
  },

  findDuplicates: (files: { path: string; name: string; size: number; modifiedAt: Date }[]) =>
    ipcRenderer.invoke('duplicates:start', { files }),

  cancelDuplicateScan: () =>
    ipcRenderer.send('duplicates:cancel'),

  onDuplicateProgress: (callback: (progress: unknown) => void) => {
    const handler = (_event: unknown, progress: unknown) => callback(progress);
    ipcRenderer.on('duplicates:progress', handler);
    return () => {
      ipcRenderer.removeListener('duplicates:progress', handler);
    };
  },

  getScanHistory: (limit?: number, offset?: number) =>
    ipcRenderer.invoke('history:get-scans', { limit, offset }),

  getScanDetail: (id: string) =>
    ipcRenderer.invoke('history:get-scan', { id }),

  getLatestScan: () =>
    ipcRenderer.invoke('history:latest-scan'),

  getLatestCleanup: () =>
    ipcRenderer.invoke('history:latest-cleanup'),

  getTotalRecovered: () =>
    ipcRenderer.invoke('history:total-recovered'),

  compareScans: (scanId1: string, scanId2: string) =>
    ipcRenderer.invoke('history:compare', { scanId1, scanId2 }),

  revealInFinder: (filePath: string) =>
    ipcRenderer.invoke('fs:reveal', { path: filePath }),

  openFile: (filePath: string) =>
    ipcRenderer.invoke('fs:open', { path: filePath }),

  getHomeDirectory: () =>
    ipcRenderer.invoke('env:home'),

  getAppVersion: () =>
    ipcRenderer.invoke('app:version'),

  getSettings: () =>
    ipcRenderer.invoke('settings:get'),

  updateSettings: (settings: Partial<import('./settings/types').UserSettings>) =>
    ipcRenderer.invoke('settings:update', settings),

  resetSettings: () =>
    ipcRenderer.invoke('settings:reset'),

  selectFolder: () =>
    ipcRenderer.invoke('settings:select-folder'),

  resetHistory: () =>
    ipcRenderer.invoke('history:reset'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
