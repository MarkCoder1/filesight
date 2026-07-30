import { rename, copyFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import { getData, loadDatabase, saveDatabase } from '../database/database';

export interface UndoMoveEntry {
  originalPath: string;
  newPath: string;
}

export function getUndoHistory(): Array<{
  id: string;
  date: string;
  planId: string;
  label: string;
  moves: UndoMoveEntry[];
  totalFiles: number;
  totalSize: number;
}> {
  const data = getData();
  return data.organizations ?? [];
}

export async function saveOrganizationRecord(record: {
  planId: string;
  label: string;
  moves: UndoMoveEntry[];
  totalFiles: number;
  totalSize: number;
}): Promise<void> {
  await loadDatabase();
  const data = getData();

  if (!data.organizations) data.organizations = [];

  data.organizations.unshift({
    id: randomUUID(),
    date: new Date().toISOString(),
    planId: record.planId,
    label: record.label,
    moves: record.moves,
    totalFiles: record.totalFiles,
    totalSize: record.totalSize,
  });

  await saveDatabase();
}

export async function undoMoves(
  moves: UndoMoveEntry[],
): Promise<{ undoneCount: number; failedCount: number }> {
  let undoneCount = 0;
  let failedCount = 0;

  for (const move of moves) {
    try {
      const targetDir = path.dirname(move.originalPath);
      await rename(move.newPath, move.originalPath).catch(async () => {
        await copyFile(move.newPath, move.originalPath);
        await unlink(move.newPath);
      });
      undoneCount++;
    } catch {
      failedCount++;
    }
  }

  return { undoneCount, failedCount };
}

export async function removeUndoRecord(recordId: string): Promise<void> {
  await loadDatabase();
  const data = getData();
  if (data.organizations) {
    data.organizations = data.organizations.filter((r) => r.id !== recordId);
    await saveDatabase();
  }
}
