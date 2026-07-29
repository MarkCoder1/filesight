export const IPC_CHANNELS = {
  SCAN_START: 'scan:start',
  SCAN_PROGRESS: 'scan:progress',
  SCAN_COMPLETE: 'scan:complete',
  ANALYZE_RUN: 'analyze:run',
  MOVE_TO_TRASH: 'trash:move',
  DUPLICATES_START: 'duplicates:start',
  DUPLICATES_CANCEL: 'duplicates:cancel',
  DUPLICATES_PROGRESS: 'duplicates:progress',
  HISTORY_GET_SCANS: 'history:get-scans',
  HISTORY_GET_SCAN: 'history:get-scan',
  HISTORY_LATEST_SCAN: 'history:latest-scan',
  HISTORY_LATEST_CLEANUP: 'history:latest-cleanup',
  HISTORY_TOTAL_RECOVERED: 'history:total-recovered',
  HISTORY_COMPARE: 'history:compare',
  HISTORY_RESET: 'history:reset',
  REVEAL_IN_FINDER: 'fs:reveal',
  OPEN_FILE: 'fs:open',
  GET_HOME_DIRECTORY: 'env:home',
  GET_APP_VERSION: 'app:version',
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_RESET: 'settings:reset',
  SETTINGS_SELECT_FOLDER: 'settings:select-folder',
} as const;

export function getElectronAPI() {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
}
