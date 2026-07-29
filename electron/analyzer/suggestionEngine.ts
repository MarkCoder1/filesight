import type { FileEntry } from '../../src/types';
import type { Suggestion } from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const INSTALLER_EXTS = new Set(['.exe', '.dmg', '.pkg', '.msi', '.deb', '.rpm', '.appimage']);
const ARCHIVE_EXTS = new Set(['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz']);

export function generateSuggestions(files: FileEntry[]): Suggestion[] {
  const now = Date.now();
  const suggestions: Suggestion[] = [];

  const oldInstallers = files.filter(
    (f) =>
      !f.isDirectory &&
      INSTALLER_EXTS.has(f.extension.toLowerCase()) &&
      new Date(f.modifiedAt).getTime() < now - 180 * MS_PER_DAY,
  );

  if (oldInstallers.length > 0) {
    const totalSize = oldInstallers.reduce((s, f) => s + f.size, 0);
    suggestions.push({
      id: 'old-installers',
      type: 'old-installers',
      title: 'Old installer files',
      description: `You have ${oldInstallers.length} installer file${oldInstallers.length !== 1 ? 's' : ''} downloaded over 6 months ago. These are rarely needed again.`,
      detail: `These ${oldInstallers.length} installer${oldInstallers.length !== 1 ? 's' : ''} take up ${formatBytes(totalSize)}. Consider reviewing and removing them.`,
      fileCount: oldInstallers.length,
      totalSize,
      severity: oldInstallers.length > 10 ? 'high' : oldInstallers.length > 3 ? 'medium' : 'low',
      files: oldInstallers.map((f) => ({ name: f.name, path: f.path, size: f.size })),
    });
  }

  const largeFiles = files.filter((f) => !f.isDirectory && f.size > 2 * 1024 * 1024 * 1024);

  if (largeFiles.length > 0) {
    const totalSize = largeFiles.reduce((s, f) => s + f.size, 0);
    suggestions.push({
      id: 'large-files',
      type: 'large-files',
      title: 'Large files worth reviewing',
      description: `${largeFiles.length} file${largeFiles.length !== 1 ? 's are' : ' is'} larger than 2 GB each.`,
      detail: `These ${largeFiles.length} file${largeFiles.length !== 1 ? 's' : ''} total ${formatBytes(totalSize)}. Consider archiving or removing them.`,
      fileCount: largeFiles.length,
      totalSize,
      severity: largeFiles.length > 3 ? 'high' : 'medium',
      files: largeFiles.map((f) => ({ name: f.name, path: f.path, size: f.size })),
    });
  }

  const oldArchives = files.filter(
    (f) =>
      !f.isDirectory &&
      ARCHIVE_EXTS.has(f.extension.toLowerCase()) &&
      new Date(f.modifiedAt).getTime() < now - 365 * MS_PER_DAY,
  );

  if (oldArchives.length > 0) {
    const totalSize = oldArchives.reduce((s, f) => s + f.size, 0);
    suggestions.push({
      id: 'stale-archives',
      type: 'stale-archives',
      title: 'Archives from over a year ago',
      description: `Found ${oldArchives.length} archive file${oldArchives.length !== 1 ? 's' : ''} that ${oldArchives.length !== 1 ? 'have' : 'has'} been untouched for over a year.`,
      detail: `These ${oldArchives.length} archive${oldArchives.length !== 1 ? 's' : ''} total ${formatBytes(totalSize)}. The contents may already be extracted elsewhere.`,
      fileCount: oldArchives.length,
      totalSize,
      severity: oldArchives.length > 5 ? 'high' : 'medium',
      files: oldArchives.map((f) => ({ name: f.name, path: f.path, size: f.size })),
    });
  }

  return suggestions;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const factor = 1024;
  const index = Math.floor(Math.log(bytes) / Math.log(factor));
  const value = bytes / Math.pow(factor, index);
  return `${value.toFixed(1)} ${units[index]}`;
}
