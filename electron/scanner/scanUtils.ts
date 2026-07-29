import path from 'path';

import type { FileCategory } from '../../src/types';
import { SYSTEM_FILES } from './types';

export function generateId(filePath: string): string {
  let hash = 0;
  const str = filePath;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(6, '0') + '-' + Date.now().toString(36);
}

export function shouldSkipFile(
  name: string,
  filePath: string,
  isSymlink: boolean,
  config: { includeHidden?: boolean; followSymlinks?: boolean },
): boolean {
  if (SYSTEM_FILES.has(name)) {
    return true;
  }

  if (!config.includeHidden && name.startsWith('.')) {
    return true;
  }

  if (isSymlink && !config.followSymlinks) {
    return true;
  }

  return false;
}

export function getExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return ext || '';
}

export function getCategory(extension: string): FileCategory {
  const categoryMap: Record<string, FileCategory> = {
    '.jpg': 'images',
    '.jpeg': 'images',
    '.png': 'images',
    '.gif': 'images',
    '.webp': 'images',
    '.svg': 'images',
    '.bmp': 'images',
    '.ico': 'images',
    '.heic': 'images',
    '.avif': 'images',
    '.tiff': 'images',
    '.tif': 'images',

    '.mp4': 'videos',
    '.mov': 'videos',
    '.avi': 'videos',
    '.mkv': 'videos',
    '.webm': 'videos',
    '.wmv': 'videos',
    '.flv': 'videos',
    '.m4v': 'videos',

    '.pdf': 'documents',
    '.doc': 'documents',
    '.docx': 'documents',
    '.xls': 'documents',
    '.xlsx': 'documents',
    '.ppt': 'documents',
    '.pptx': 'documents',
    '.txt': 'documents',
    '.rtf': 'documents',
    '.odt': 'documents',
    '.csv': 'documents',
    '.md': 'documents',

    '.zip': 'archives',
    '.tar': 'archives',
    '.gz': 'archives',
    '.bz2': 'archives',
    '.7z': 'archives',
    '.rar': 'archives',
    '.tgz': 'archives',

    '.dmg': 'installers',
    '.exe': 'installers',
    '.msi': 'installers',
    '.pkg': 'installers',
    '.appimage': 'installers',
    '.deb': 'installers',
    '.rpm': 'installers',

    '.app': 'applications',

    '.mp3': 'audio',
    '.wav': 'audio',
    '.flac': 'audio',
    '.aac': 'audio',
    '.ogg': 'audio',
    '.wma': 'audio',
    '.m4a': 'audio',
    '.aiff': 'audio',

    '.js': 'code',
    '.ts': 'code',
    '.jsx': 'code',
    '.tsx': 'code',
    '.py': 'code',
    '.java': 'code',
    '.c': 'code',
    '.cpp': 'code',
    '.h': 'code',
    '.hpp': 'code',
    '.json': 'code',
    '.xml': 'code',
    '.yaml': 'code',
    '.yml': 'code',
    '.sh': 'code',
    '.bash': 'code',
    '.zsh': 'code',
    '.rb': 'code',
    '.go': 'code',
    '.rs': 'code',
    '.swift': 'code',
    '.kt': 'code',
    '.css': 'code',
    '.scss': 'code',
    '.less': 'code',
    '.html': 'code',
    '.htm': 'code',
    '.sql': 'code',
    '.toml': 'code',
    '.cfg': 'code',
    '.ini': 'code',
    '.env': 'code',
  };

  return categoryMap[extension] || 'other';
}

export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}
