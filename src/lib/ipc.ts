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
  READ_TEXT_FILE: 'fs:read-text-file',
  READ_IMAGE_FILE: 'fs:read-image-file',
  READ_FILE_CHUNK: 'fs:read-file-chunk',
  FILE_EXISTS: 'fs:file-exists',
  OPEN_IN_FOLDER: 'fs:open-in-folder',
  COPY_TO_CLIPBOARD: 'fs:copy-to-clipboard',
  FILE_STAT: 'fs:file-stat',
} as const;

export function getElectronAPI() {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
}
