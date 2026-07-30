import { describe, expect, it } from 'vitest';

import {
  shouldSkipFile,
  getExtension,
  getCategory,
  generateId,
} from '../../electron/scanner/scanUtils';

describe('generateId', () => {
  it('generates a string id', () => {
    const id = generateId('/some/path/file.txt');
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('generates different ids for different paths', () => {
    const id1 = generateId('/path/a.txt');
    const id2 = generateId('/path/b.txt');
    expect(id1).not.toBe(id2);
  });

  it('generates consistent ids for the same path', () => {
    const id1 = generateId('/path/file.txt');
    const id2 = generateId('/path/file.txt');
    expect(id1.split('-')[0]).toBe(id2.split('-')[0]);
  });
});

describe('shouldSkipFile', () => {
  const config = { includeHidden: false, followSymlinks: false };

  it('skips .DS_Store', () => {
    expect(shouldSkipFile('.DS_Store', '/path/.DS_Store', false, config)).toBe(true);
  });

  it('skips Thumbs.db', () => {
    expect(shouldSkipFile('Thumbs.db', '/path/Thumbs.db', false, config)).toBe(true);
  });

  it('skips desktop.ini', () => {
    expect(shouldSkipFile('desktop.ini', '/path/desktop.ini', false, config)).toBe(true);
  });

  it('skips hidden files by default', () => {
    expect(shouldSkipFile('.hidden', '/path/.hidden', false, config)).toBe(true);
  });

  it('includes hidden files when configured', () => {
    expect(
      shouldSkipFile('.hidden', '/path/.hidden', false, {
        includeHidden: true,
        followSymlinks: false,
      }),
    ).toBe(false);
  });

  it('skips symlinks by default', () => {
    expect(shouldSkipFile('link', '/path/link', true, config)).toBe(true);
  });

  it('includes regular files', () => {
    expect(shouldSkipFile('readme.txt', '/path/readme.txt', false, config)).toBe(false);
  });
});

describe('getExtension', () => {
  it('returns extension for known files', () => {
    expect(getExtension('/path/file.txt')).toBe('.txt');
    expect(getExtension('/path/image.jpg')).toBe('.jpg');
    expect(getExtension('archive.tar.gz')).toBe('.gz');
  });

  it('returns empty string for files without extension', () => {
    expect(getExtension('/path/README')).toBe('');
  });

  it('returns lowercase extension', () => {
    expect(getExtension('/path/Photo.JPG')).toBe('.jpg');
  });
});

describe('getCategory', () => {
  it('categorizes images correctly', () => {
    expect(getCategory('.jpg')).toBe('images');
    expect(getCategory('.png')).toBe('images');
    expect(getCategory('.gif')).toBe('images');
  });

  it('categorizes documents correctly', () => {
    expect(getCategory('.pdf')).toBe('documents');
    expect(getCategory('.docx')).toBe('documents');
    expect(getCategory('.txt')).toBe('documents');
  });

  it('categorizes installers correctly', () => {
    expect(getCategory('.dmg')).toBe('installers');
    expect(getCategory('.exe')).toBe('installers');
    expect(getCategory('.pkg')).toBe('installers');
  });

  it('categorizes archives correctly', () => {
    expect(getCategory('.zip')).toBe('archives');
    expect(getCategory('.tar')).toBe('archives');
    expect(getCategory('.rar')).toBe('archives');
  });

  it('returns other for unknown extensions', () => {
    expect(getCategory('.xyz')).toBe('other');
    expect(getCategory('.abc')).toBe('other');
  });
});
