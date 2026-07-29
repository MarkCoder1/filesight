'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSettingsStore } from '@/stores/settings-store';
import type { UserSettings } from '@/types';

import { useIpc } from './use-ipc';

export function useSettings() {
  const ipc = useIpc();
  const fetched = useRef(false);

  const {
    settings,
    settingsLoading,
    settingsLoaded,
    error,
    setSettings,
    mergeSettings,
    setSettingsLoading,
    setError,
  } = useSettingsStore();

  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    setError(null);
    try {
      const result = await ipc.getSettings();
      setSettings(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      setError(message);
      return null;
    } finally {
      setSettingsLoading(false);
    }
  }, [ipc, setSettings, setSettingsLoading, setError]);

  useEffect(() => {
    if (!fetched.current && ipc.isAvailable) {
      fetched.current = true;
      fetchSettings();
    }
  }, [ipc.isAvailable, fetchSettings]);

  const updateSetting = useCallback(
    async (partial: Partial<UserSettings>) => {
      setSaved(false);
      mergeSettings(partial);
      try {
        const result = await ipc.updateSettings(partial);
        setSettings(result);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update setting';
        setError(message);
        return null;
      }
    },
    [ipc, mergeSettings, setSettings, setError],
  );

  const resetSetting = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const result = await ipc.resetSettings();
      setSettings(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(message);
      return null;
    } finally {
      setSettingsLoading(false);
    }
  }, [ipc, setSettings, setError, setSettingsLoading]);

  const selectFolder = useCallback(async () => {
    try {
      const folder = await ipc.selectFolder();
      if (folder) {
        await updateSetting({ defaultScanFolder: folder });
      }
      return folder;
    } catch {
      return null;
    }
  }, [ipc, updateSetting]);

  return {
    settings,
    settingsLoading,
    settingsLoaded,
    error,
    saved,
    fetchSettings,
    updateSetting,
    resetSetting,
    selectFolder,
  };
}
