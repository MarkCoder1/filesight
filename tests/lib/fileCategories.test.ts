import { describe, it, expect } from 'vitest';
import { categoryFromExtension, CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/fileCategories';
import type { FileCategory } from '@/types';

describe('categoryFromExtension', () => {
  it.each([
    ['jpg', 'images'],
    ['jpeg', 'images'],
    ['png', 'images'],
    ['gif', 'images'],
    ['webp', 'images'],
    ['svg', 'images'],
    ['bmp', 'images'],
    ['ico', 'images'],
    ['heic', 'images'],
    ['raw', 'images'],
  ])('maps .%s to images', (ext, expected) => {
    expect(categoryFromExtension(ext)).toBe(expected);
  });

  it.each([
    ['mp4', 'videos'],
    ['mkv', 'videos'],
    ['mov', 'videos'],
    ['avi', 'videos'],
    ['wmv', 'videos'],
    ['flv', 'videos'],
    ['webm', 'videos'],
    ['m4v', 'videos'],
  ])('maps .%s to videos', (ext, expected) => {
    expect(categoryFromExtension(ext)).toBe(expected);
  });

  it.each([
    ['pdf', 'documents'],
    ['doc', 'documents'],
    ['docx', 'documents'],
    ['xls', 'documents'],
    ['xlsx', 'documents'],
    ['ppt', 'documents'],
    ['pptx', 'documents'],
    ['txt', 'documents'],
    ['rtf', 'documents'],
    ['odt', 'documents'],
    ['csv', 'documents'],
  ])('maps .%s to documents', (ext, expected) => {
    expect(categoryFromExtension(ext)).toBe(expected);
  });

  it.each([
    ['zip', 'archives'],
    ['rar', 'archives'],
    ['7z', 'archives'],
    ['tar', 'archives'],
    ['gz', 'archives'],
    ['bz2', 'archives'],
    ['xz', 'archives'],
  ])('maps .%s to archives', (ext, expected) => {
    expect(categoryFromExtension(ext)).toBe(expected);
  });

  it.each([
    ['dmg', 'installers'],
    ['exe', 'installers'],
    ['msi', 'installers'],
    ['pkg', 'installers'],
    ['deb', 'installers'],
    ['rpm', 'installers'],
    ['appimage', 'installers'],
  ])('maps .%s to installers', (ext, expected) => {
    expect(categoryFromExtension(ext)).toBe(expected);
  });

  it.each([
    ['app', 'applications'],
  ])('maps .%s to applications', (ext, expected) => {
    expect(categoryFromExtension(ext)).toBe(expected);
  });

  it.each([
    ['mp3', 'audio'],
    ['wav', 'audio'],
    ['flac', 'audio'],
    ['aac', 'audio'],
    ['ogg', 'audio'],
    ['wma', 'audio'],
    ['m4a', 'audio'],
  ])('maps .%s to audio', (ext, expected) => {
    expect(categoryFromExtension(ext)).toBe(expected);
  });

  const codeExtensions = [
    'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
    'rs', 'go', 'rb', 'php', 'swift', 'kt', 'scala',
    'sh', 'bash', 'zsh', 'yml', 'yaml', 'json', 'xml', 'html',
    'css', 'scss', 'sql', 'toml', 'cfg',
  ];
  it.each(codeExtensions)('maps .%s to code', (ext) => {
    expect(categoryFromExtension(ext as string)).toBe('code');
  });

  it('strips leading dot', () => {
    expect(categoryFromExtension('.pdf')).toBe('documents');
  });

  it('is case insensitive', () => {
    expect(categoryFromExtension('JPG')).toBe('images');
    expect(categoryFromExtension('Png')).toBe('images');
  });

  it('returns "other" for unknown extensions', () => {
    expect(categoryFromExtension('xyz')).toBe('other');
  });

  it('returns "other" for empty string', () => {
    expect(categoryFromExtension('')).toBe('other');
  });

  it('handles mixed case extension with leading dot', () => {
    expect(categoryFromExtension('.Mp4')).toBe('videos');
  });
});

describe('CATEGORIES', () => {
  it('contains all expected categories', () => {
    const expected: FileCategory[] = [
      'images', 'videos', 'documents', 'archives',
      'installers', 'applications', 'audio', 'code', 'other',
    ];
    expect(CATEGORIES).toEqual(expected);
  });
});

describe('CATEGORY_LABELS', () => {
  it('has labels for all categories', () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(typeof CATEGORY_LABELS[cat]).toBe('string');
    }
  });
});

describe('CATEGORY_COLORS', () => {
  it('has colors for all categories', () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_COLORS[cat]).toBeDefined();
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('EXTENSION_MAP coverage', () => {
  it('hpp is mapped', () => {
    expect(categoryFromExtension('hpp')).toBe('code');
  });

  it('h is mapped to code', () => {
    expect(categoryFromExtension('h')).toBe('code');
  });
});
