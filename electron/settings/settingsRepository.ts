import { app } from 'electron';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

import { DEFAULT_SETTINGS, type UserSettings } from './types';

let customSettingsPath: string | null = null;
let cachedSettings: UserSettings | null = null;

export function setSettingsPath(filePath: string): void {
  customSettingsPath = filePath;
  cachedSettings = null;
}

function getSettingsPath(): string {
  if (customSettingsPath) return customSettingsPath;
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'settings.json');
}

export async function loadSettings(): Promise<UserSettings> {
  if (cachedSettings) return cachedSettings;

  const filePath = getSettingsPath();

  try {
    const raw = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
    return cachedSettings;
  } catch {
    cachedSettings = { ...DEFAULT_SETTINGS };
    return cachedSettings;
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const current = await loadSettings();
  const updated: UserSettings = { ...current, ...settings };
  cachedSettings = updated;

  const filePath = getSettingsPath();
  const dir = path.dirname(filePath);

  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // directory already exists
  }

  await writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export async function resetSettings(): Promise<UserSettings> {
  cachedSettings = { ...DEFAULT_SETTINGS };

  const filePath = getSettingsPath();
  const dir = path.dirname(filePath);

  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // directory already exists
  }

  await writeFile(filePath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  return { ...DEFAULT_SETTINGS };
}

export function getCachedSettings(): UserSettings {
  if (cachedSettings) return cachedSettings;
  return { ...DEFAULT_SETTINGS };
}
