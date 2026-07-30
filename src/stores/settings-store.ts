'use client';

import { create } from 'zustand';

import type { ThemeMode, UserSettings } from '@/types';

import { DEFAULT_USER_SETTINGS } from '@/types';

export interface SettingsState {
  settings: UserSettings;
  settingsLoading: boolean;
  settingsLoaded: boolean;
  error: string | null;
  setSettings: (settings: UserSettings) => void;
  mergeSettings: (partial: Partial<UserSettings>) => void;
  setSettingsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: { ...DEFAULT_USER_SETTINGS },
  settingsLoading: false,
  settingsLoaded: false,
  error: null,

  setSettings: (settings) => set({ settings, settingsLoaded: true }),
  mergeSettings: (partial) => set((state) => ({ settings: { ...state.settings, ...partial } })),
  setSettingsLoading: (settingsLoading) => set({ settingsLoading }),
  setError: (error) => set({ error }),
}));
