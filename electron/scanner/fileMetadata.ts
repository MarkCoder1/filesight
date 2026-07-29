import fs from 'fs/promises';

import path from 'path';

import type { FileEntry } from '../../src/types';

import { generateId, getCategory, getExtension } from './scanUtils';

export interface RawEntry {
  name: string;
  fullPath: string;
  isDirectory: boolean;
  isSymlink: boolean;
}

export async function getRawEntry(parentPath: string, name: string): Promise<RawEntry | null> {
  try {
    const fullPath = path.join(parentPath, name);
    const stat = await fs.lstat(fullPath);
    return {
      name,
      fullPath,
      isDirectory: stat.isDirectory(),
      isSymlink: stat.isSymbolicLink(),
    };
  } catch {
    return null;
  }
}

export async function getFileInfo(entry: RawEntry): Promise<FileEntry | null> {
  try {
    const stat = await fs.stat(entry.fullPath);
    const ext = getExtension(entry.name);

    return {
      id: generateId(entry.fullPath),
      name: entry.name,
      path: entry.fullPath,
      extension: ext,
      size: stat.size,
      createdAt: stat.birthtime,
      modifiedAt: stat.mtime,
      isDirectory: entry.isDirectory,
      category: getCategory(ext),
    };
  } catch {
    return null;
  }
}
