import { ipcMain } from 'electron';

import { generatePlan } from '../services/organizationEngine';
import { executeMoves } from '../services/moveManager';
import { saveOrganizationRecord, undoMoves, getUndoHistory, removeUndoRecord } from '../services/undoManager';

export function registerOrganizationHandlers(): void {
  ipcMain.handle('org:generate-plan', async (_event, { files, sourceFolder }) => {
    return generatePlan(files, sourceFolder);
  });

  ipcMain.handle('org:execute-moves', async (_event, { operations }) => {
    const result = await executeMoves(operations);

    if (result.successCount > 0) {
      const moves = result.moves
        .filter((m) => m.status !== 'skipped')
        .map((m) => ({
          originalPath: m.originalPath,
          newPath: m.resolvedPath ?? m.newPath,
        }));

      await saveOrganizationRecord({
        planId: '',
        label: `Organized ${result.successCount} file${result.successCount !== 1 ? 's' : ''}`,
        moves,
        totalFiles: operations.length,
        totalSize: result.totalSize,
      });
    }

    return result;
  });

  ipcMain.handle('org:get-history', async () => {
    return getUndoHistory();
  });

  ipcMain.handle('org:undo-moves', async (_event, { recordId, moves }) => {
    const undoResult = await undoMoves(moves);
    await removeUndoRecord(recordId);
    return undoResult;
  });
}
