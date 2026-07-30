import { ipcMain } from 'electron';

import type { FileEntry } from '../../src/types';
import { analyzeFiles } from '../analyzer';

export function registerAnalyzeHandlers(): void {
  ipcMain.handle('analyze:run', async (_event, { files }: { files: FileEntry[] }) => {
    return analyzeFiles(files);
  });
}
