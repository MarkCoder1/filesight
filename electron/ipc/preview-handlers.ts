import { ipcMain, clipboard, shell } from 'electron';
import fs from 'fs/promises';
import path from 'path';

const MAX_TEXT_SIZE = 512 * 1024;
const MAX_LINES = 3000;
const MAX_BINARY_PREVIEW_SIZE = 100 * 1024 * 1024;

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    pdf: 'application/pdf',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
  };
  return map[ext] || 'application/octet-stream';
}

async function readImageBase64(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const supported = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  if (!supported.includes(ext)) {
    throw new Error(`Unsupported image type: ${ext}`);
  }
  const buffer = await fs.readFile(filePath);
  const mime = getMimeType(ext);
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

export function registerPreviewHandlers(): void {
  ipcMain.handle('fs:read-text-file', async (_event, { path: filePath }: { path: string }) => {
    const stat = await fs.stat(filePath);
    const truncated = stat.size > MAX_TEXT_SIZE;
    const buffer = await fs.readFile(filePath, {
      encoding: 'utf-8',
      flag: 'r',
    });
    let content = truncated ? buffer.slice(0, MAX_TEXT_SIZE) : buffer;

    const lines = content.split('\n');
    if (lines.length > MAX_LINES) {
      content = lines.slice(0, MAX_LINES).join('\n');
    }
    return { content, truncated };
  });

  ipcMain.handle('fs:read-image-file', async (_event, { path: filePath }: { path: string }) => {
    return readImageBase64(filePath);
  });

  ipcMain.handle('fs:read-file-base64', async (_event, { path: filePath }: { path: string }) => {
    const stat = await fs.stat(filePath);
    const tooLarge = stat.size > MAX_BINARY_PREVIEW_SIZE;
    const ext = path.extname(filePath).toLowerCase().slice(1);
    const mime = getMimeType(ext);
    if (tooLarge) {
      return { data: null, mime, tooLarge: true, size: stat.size };
    }
    const buffer = await fs.readFile(filePath);
    return { data: buffer.toString('base64'), mime, tooLarge: false, size: stat.size };
  });

  ipcMain.handle('fs:file-exists', async (_event, { path: filePath }: { path: string }) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('fs:open-in-folder', (_event, { path: filePath }: { path: string }) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle('fs:copy-to-clipboard', (_event, { text }: { text: string }) => {
    clipboard.writeText(text);
  });

  ipcMain.handle('fs:file-stat', async (_event, { path: filePath }: { path: string }) => {
    const stat = await fs.stat(filePath);
    return {
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      createdAt: stat.birthtime.toISOString(),
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
    };
  });
}
