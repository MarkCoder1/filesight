import { app } from 'electron';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

import type { StoredData } from './types';

const DEFAULT_DATA: StoredData = { scans: [], cleanups: [], organizations: [] };

let customDbPath: string | null = null;
let cachedData: StoredData | null = null;

export function setDbPath(filePath: string): void {
  customDbPath = filePath;
  cachedData = null;
}

function getDbPath(): string {
  if (customDbPath) return customDbPath;
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'database.json');
}

export async function loadDatabase(): Promise<StoredData> {
  if (cachedData) return cachedData;

  const dbPath = getDbPath();

  try {
    const raw = await readFile(dbPath, 'utf-8');
    cachedData = JSON.parse(raw) as StoredData;
    return cachedData;
  } catch {
    cachedData = { scans: [], cleanups: [], organizations: [] };
    return cachedData;
  }
}

export async function saveDatabase(): Promise<void> {
  if (!cachedData) return;

  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);

  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // directory already exists
  }

  await writeFile(dbPath, JSON.stringify(cachedData, null, 2), 'utf-8');
}

export function getData(): StoredData {
  if (!cachedData) {
    cachedData = { scans: [], cleanups: [], organizations: [] };
  }
  return cachedData;
}

export async function resetDatabase(): Promise<void> {
  cachedData = { scans: [], cleanups: [], organizations: [] };
  await saveDatabase();
}
