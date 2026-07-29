import path from 'path';
import { describe, expect, it } from 'vitest';

import { collectFiles, countFiles } from '../../electron/scanner/fileCollector';

const FIXTURES_DIR = path.resolve(__dirname, '../../test-fixtures');

describe('collectFiles', () => {
  it('collects all non-system files recursively', async () => {
    const result = await collectFiles(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    });

    const names = result.files.map((f) => f.entry.name).sort();
    expect(names).toContain('photo.jpg');
    expect(names).toContain('notes.txt');
    expect(names).toContain('data.json');
    expect(names).toContain('script.sh');
  });

  it('excludes system files like .DS_Store', async () => {
    const result = await collectFiles(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    });

    const names = result.files.map((f) => f.entry.name);
    expect(names).not.toContain('.DS_Store');
    expect(names).not.toContain('.localized');
  });

  it('excludes hidden files by default', async () => {
    const result = await collectFiles(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    });

    const names = result.files.map((f) => f.entry.name);
    expect(names).not.toContain('.hidden_file');
  });

  it('includes hidden files when configured', async () => {
    const result = await collectFiles(FIXTURES_DIR, {
      includeHidden: true,
      followSymlinks: false,
    });

    const names = result.files.map((f) => f.entry.name);
    expect(names).toContain('.hidden_file');
  });

  it('collects files from subdirectories', async () => {
    const result = await collectFiles(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    });

    const names = result.files.map((f) => f.entry.name);
    expect(names).toContain('notes.txt');
  });

  it('returns correct file count', async () => {
    const result = await collectFiles(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    });

    expect(result.totalCount).toBe(4);
  });

  it('returns empty result for empty directories', async () => {
    const emptyDir = path.join(FIXTURES_DIR, 'empty_dir');
    const result = await collectFiles(emptyDir, {
      includeHidden: false,
      followSymlinks: false,
    });

    expect(result.totalCount).toBe(0);
    expect(result.files).toHaveLength(0);
  });
});

describe('countFiles', () => {
  it('counts files without collecting metadata', async () => {
    const count = await countFiles(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    });

    expect(count).toBe(4);
  });
});
