import { app } from 'electron';
import path from 'path';

import { loadSettings, resetSettings, saveSettings } from './settingsRepository';
import { DEFAULT_SETTINGS, type UserSettings } from './types';

export async function getSettings(): Promise<UserSettings> {
  const settings = await loadSettings();

  if (!settings.defaultScanFolder) {
    settings.defaultScanFolder = path.join(app.getPath('home'), 'Downloads');
  }

  return settings;
}

export async function updateSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  return saveSettings(partial);
}

export async function restoreDefaults(): Promise<UserSettings> {
  await resetSettings();
  const settings = { ...DEFAULT_SETTINGS };
  if (!settings.defaultScanFolder) {
    settings.defaultScanFolder = path.join(app.getPath('home'), 'Downloads');
  }
  return settings;
}
