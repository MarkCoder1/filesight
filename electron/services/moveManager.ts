import { mkdir, rename, copyFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export type ConflictAction = 'rename' | 'skip' | 'replace';

export interface MoveOperation {
  id: string;
  originalPath: string;
  newPath: string;
  fileName: string;
  size: number;
  category: string;
}

export interface MoveResult {
  id: string;
  originalPath: string;
  newPath: string;
  fileName: string;
  category: string;
  size: number;
  status: 'moved' | 'skipped' | 'conflict';
  resolvedPath?: string;
}

export interface ExecuteMovesResult {
  successCount: number;
  skipCount: number;
  conflictCount: number;
  totalSize: number;
  moves: MoveResult[];
}

async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

function resolveConflict(
  originalPath: string,
  newPath: string,
  fileName: string,
  targetDir: string,
  action: ConflictAction,
  usedNames: Set<string>,
): string | null {
  if (action === 'skip') return null;

  if (action === 'replace') {
    return newPath;
  }

  // rename
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  let counter = 1;
  let resolved: string;
  do {
    resolved = path.join(targetDir, `${baseName} (${counter})${ext}`);
    counter++;
  } while (usedNames.has(resolved));
  usedNames.add(resolved);
  return resolved;
}

export async function executeMoves(
  operations: MoveOperation[],
  onProgress?: (current: number, total: number) => void,
): Promise<ExecuteMovesResult> {
  const results: MoveResult[] = [];
  let successCount = 0;
  let skipCount = 0;
  let conflictCount = 0;
  const totalSize = operations.reduce((s, o) => s + o.size, 0);

  const dirsCreated = new Set<string>();

  const existingPaths = new Set<string>();
  for (const op of operations) {
    existingPaths.add(op.newPath);
  }

  const usedNames = new Set<string>();

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];

    try {
      const targetDir = path.dirname(op.newPath);

      if (!dirsCreated.has(targetDir)) {
        await ensureDir(targetDir);
        dirsCreated.add(targetDir);
      }

      let resolvedPath: string | undefined;
      let status: 'moved' | 'skipped' | 'conflict' = 'moved';

      if (existingPaths.has(op.newPath) && op.newPath !== op.originalPath) {
        const resolved = resolveConflict(
          op.originalPath,
          op.newPath,
          op.fileName,
          targetDir,
          'rename',
          usedNames,
        );

        if (resolved === null) {
          status = 'skipped';
          skipCount++;
        } else if (resolved !== op.newPath) {
          status = 'conflict';
          resolvedPath = resolved;
          conflictCount++;
        }
      }

      if (status !== 'skipped') {
        const finalPath = resolvedPath ?? op.newPath;
        await rename(op.originalPath, finalPath).catch(async () => {
          await copyFile(op.originalPath, finalPath);
          await unlink(op.originalPath);
        });
        successCount++;
      }

      results.push({
        id: op.id,
        originalPath: op.originalPath,
        newPath: resolvedPath ?? op.newPath,
        fileName: op.fileName,
        category: op.category,
        size: op.size,
        status,
        resolvedPath,
      });
    } catch {
      results.push({
        id: op.id,
        originalPath: op.originalPath,
        newPath: op.newPath,
        fileName: op.fileName,
        category: op.category,
        size: op.size,
        status: 'skipped',
      });
      skipCount++;
    }

    onProgress?.(i + 1, operations.length);
  }

  return { successCount, skipCount, conflictCount, totalSize, moves: results };
}
