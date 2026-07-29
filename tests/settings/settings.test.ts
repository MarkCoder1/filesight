/// <reference types="vitest" />
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  loadSettings,
  resetSettings,
  saveSettings,
  setSettingsPath,
} from '../../electron/settings/settingsRepository';
import { DEFAULT_SETTINGS } from '../../electron/settings/types';

describe('SettingsRepository', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-test-'));
    setSettingsPath(path.join(testDir, 'settings.json'));
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('returns defaults when no file exists', async () => {
    const settings = await loadSettings();
    expect(settings.theme).toBe('system');
    expect(settings.includeHiddenFiles).toBe(false);
    expect(settings.followSymbolicLinks).toBe(false);
    expect(settings.scanDepth).toBeNull();
    expect(settings.showLargeFilesThreshold).toBe(2 * 1024 * 1024 * 1024);
    expect(settings.showOldFilesThresholdDays).toBe(180);
    expect(settings.enableScanHistory).toBe(true);
    expect(settings.defaultScanFolder).toBe('');
  });

  it('persists and reloads settings', async () => {
    const saved = await saveSettings({ theme: 'dark' });
    expect(saved.theme).toBe('dark');

    const reloaded = await loadSettings();
    expect(reloaded.theme).toBe('dark');
    expect(reloaded.includeHiddenFiles).toBe(false);
  });

  it('merges partial settings', async () => {
    await saveSettings({ includeHiddenFiles: true });
    await saveSettings({ scanDepth: 5 });

    const settings = await loadSettings();
    expect(settings.includeHiddenFiles).toBe(true);
    expect(settings.scanDepth).toBe(5);
    expect(settings.theme).toBe('system');
  });

  it('resets settings to defaults', async () => {
    await saveSettings({ theme: 'light', includeHiddenFiles: true });
    const reset = await resetSettings();
    expect(reset.theme).toBe('system');
    expect(reset.includeHiddenFiles).toBe(false);
    expect(reset.scanDepth).toBeNull();

    const reloaded = await loadSettings();
    expect(reloaded.theme).toBe('system');
  });

  it('persists file to disk', async () => {
    await saveSettings({ theme: 'dark', defaultScanFolder: '/custom/path' });

    const raw = await fs.readFile(path.join(testDir, 'settings.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed.theme).toBe('dark');
    expect(parsed.defaultScanFolder).toBe('/custom/path');
  });

  it('validates all default values', () => {
    expect(DEFAULT_SETTINGS.theme).toBe('system');
    expect(DEFAULT_SETTINGS.defaultScanFolder).toBe('');
    expect(DEFAULT_SETTINGS.includeHiddenFiles).toBe(false);
    expect(DEFAULT_SETTINGS.followSymbolicLinks).toBe(false);
    expect(DEFAULT_SETTINGS.scanDepth).toBeNull();
    expect(DEFAULT_SETTINGS.showLargeFilesThreshold).toBe(2147483648);
    expect(DEFAULT_SETTINGS.showOldFilesThresholdDays).toBe(180);
    expect(DEFAULT_SETTINGS.enableScanHistory).toBe(true);
  });
});
