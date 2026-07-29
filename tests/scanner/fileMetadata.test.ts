import path from 'path';
import { describe, expect, it } from 'vitest';

import { getRawEntry, getFileInfo } from '../../electron/scanner/fileMetadata';

const FIXTURES_DIR = path.resolve(__dirname, '../../test-fixtures');

describe('getRawEntry', () => {
  it('returns entry for existing file', async () => {
    const entry = await getRawEntry(FIXTURES_DIR, 'photo.jpg');
    expect(entry).not.toBeNull();
    expect(entry!.name).toBe('photo.jpg');
    expect(entry!.isDirectory).toBe(false);
  });

  it('returns null for non-existent files', async () => {
    const entry = await getRawEntry(FIXTURES_DIR, 'nonexistent.xyz');
    expect(entry).toBeNull();
  });

  it('detects directories', async () => {
    const entry = await getRawEntry(FIXTURES_DIR, 'subfolder');
    expect(entry).not.toBeNull();
    expect(entry!.isDirectory).toBe(true);
  });
});

describe('getFileInfo', () => {
  it('returns FileEntry with correct properties', async () => {
    const raw = await getRawEntry(FIXTURES_DIR, 'photo.jpg');
    expect(raw).not.toBeNull();

    const info = await getFileInfo(raw!);
    expect(info).not.toBeNull();
    expect(info!.name).toBe('photo.jpg');
    expect(info!.extension).toBe('.jpg');
    expect(info!.category).toBe('images');
    expect(info!.size).toBeGreaterThan(0);
    expect(info!.isDirectory).toBe(false);
    expect(info!.id).toBeTruthy();
  });

  it('does not crash on invalid paths', async () => {
    const raw = {
      name: 'nonexistent.xyz',
      fullPath: '/nonexistent/path/file.xyz',
      isDirectory: false,
      isSymlink: false,
    };

    const info = await getFileInfo(raw);
    expect(info).toBeNull();
  });
});
