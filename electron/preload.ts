import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  startScan: (dirPath: string) => ipcRenderer.invoke('scan:start', { path: dirPath }),

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

  runAnalysis: (files: unknown) => ipcRenderer.invoke('analyze:run', { files }),

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

  cancelDuplicateScan: () => ipcRenderer.send('duplicates:cancel'),

  onDuplicateProgress: (callback: (progress: unknown) => void) => {
    const handler = (_event: unknown, progress: unknown) => callback(progress);
    ipcRenderer.on('duplicates:progress', handler);
    return () => {
      ipcRenderer.removeListener('duplicates:progress', handler);
    };
  },

  deleteDuplicates: (files: { path: string; name: string }[], totalSize: number) =>
    ipcRenderer.invoke('duplicates:delete', { files, totalSize }),

  onDuplicateDeleteProgress: (callback: (progress: unknown) => void) => {
    const handler = (_event: unknown, progress: unknown) => callback(progress);
    ipcRenderer.on('duplicates:delete-progress', handler);
    return () => {
      ipcRenderer.removeListener('duplicates:delete-progress', handler);
    };
  },

  recommendDuplicates: (
    files: {
      path: string;
      name: string;
      size: number;
      modifiedAt: Date;
      resolution?: { width: number; height: number };
      matchType?: string;
    }[],
  ) => ipcRenderer.invoke('duplicates:recommend', { files }),

  getScanHistory: (limit?: number, offset?: number) =>
    ipcRenderer.invoke('history:get-scans', { limit, offset }),

  getScanDetail: (id: string) => ipcRenderer.invoke('history:get-scan', { id }),

  getLatestScan: () => ipcRenderer.invoke('history:latest-scan'),

  getLatestCleanup: () => ipcRenderer.invoke('history:latest-cleanup'),

  getTotalRecovered: () => ipcRenderer.invoke('history:total-recovered'),

  compareScans: (scanId1: string, scanId2: string) =>
    ipcRenderer.invoke('history:compare', { scanId1, scanId2 }),

  revealInFinder: (filePath: string) => ipcRenderer.invoke('fs:reveal', { path: filePath }),

  openFile: (filePath: string) => ipcRenderer.invoke('fs:open', { path: filePath }),

  getHomeDirectory: () => ipcRenderer.invoke('env:home'),

  getAppVersion: () => ipcRenderer.invoke('app:version'),

  getSettings: () => ipcRenderer.invoke('settings:get'),

  updateSettings: (settings: Partial<import('./settings/types').UserSettings>) =>
    ipcRenderer.invoke('settings:update', settings),

  resetSettings: () => ipcRenderer.invoke('settings:reset'),

  selectFolder: () => ipcRenderer.invoke('settings:select-folder'),

  resetHistory: () => ipcRenderer.invoke('history:reset'),

  readTextFile: (filePath: string) => ipcRenderer.invoke('fs:read-text-file', { path: filePath }),

  readImageFile: (filePath: string) => ipcRenderer.invoke('fs:read-image-file', { path: filePath }),

  readFileBase64: (filePath: string) =>
    ipcRenderer.invoke('fs:read-file-base64', { path: filePath }),

  fileExists: (filePath: string) => ipcRenderer.invoke('fs:file-exists', { path: filePath }),

  openInFolder: (filePath: string) => ipcRenderer.invoke('fs:open-in-folder', { path: filePath }),

  copyToClipboard: (text: string) => ipcRenderer.invoke('fs:copy-to-clipboard', { text }),

  fileStat: (filePath: string) => ipcRenderer.invoke('fs:file-stat', { path: filePath }),

  generateOrgPlan: (
    files: { path: string; name: string; size: number; extension: string }[],
    sourceFolder: string,
  ) => ipcRenderer.invoke('org:generate-plan', { files, sourceFolder }),

  executeOrgMoves: (
    operations: {
      id: string;
      originalPath: string;
      newPath: string;
      fileName: string;
      size: number;
      category: string;
    }[],
  ) => ipcRenderer.invoke('org:execute-moves', { operations }),

  getOrgHistory: () => ipcRenderer.invoke('org:get-history'),

  undoOrgMoves: (recordId: string, moves: { originalPath: string; newPath: string }[]) =>
    ipcRenderer.invoke('org:undo-moves', { recordId, moves }),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
