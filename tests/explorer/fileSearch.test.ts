import { describe, expect, it } from 'vitest';

import { searchFiles } from '../../src/lib/fileSearch';
import type { FileEntry } from '../../src/types';

function makeFile(name: string, extension: string, category: FileEntry['category']): FileEntry {
  return {
    id: `${name}.${extension}`,
    name,
    path: `/test/${name}.${extension}`,
    extension,
    size: 100,
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-01'),
    isDirectory: false,
    category,
  };
}

const FIXTURES: FileEntry[] = [
  makeFile('math-homework', 'pdf', 'documents'),
  makeFile('science-homework', 'docx', 'documents'),
  makeFile('photo', 'jpg', 'images'),
  makeFile('holiday-video', 'mp4', 'videos'),
  makeFile('project', 'zip', 'archives'),
  makeFile('notes', 'txt', 'documents'),
  makeFile('script', 'py', 'code'),
  makeFile('song', 'mp3', 'audio'),
];

describe('searchFiles', () => {
  it('returns all files when query is empty', () => {
    const result = searchFiles(FIXTURES, { text: '' });
    expect(result).toHaveLength(FIXTURES.length);
  });

  it('matches by filename', () => {
    const result = searchFiles(FIXTURES, { text: 'homework' });
    expect(result).toHaveLength(2);
    expect(result.map((f) => f.name)).toEqual(['math-homework', 'science-homework']);
  });

  it('matches by extension', () => {
    const result = searchFiles(FIXTURES, { text: 'pdf' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('math-homework');
  });

  it('matches by category name', () => {
    const result = searchFiles(FIXTURES, { text: 'documents' });
    expect(result).toHaveLength(3);
  });

  it('matches by category label', () => {
    const result = searchFiles(FIXTURES, { text: 'Images' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('photo');
  });

  it('is case insensitive', () => {
    const result = searchFiles(FIXTURES, { text: 'HOMEWORK' });
    expect(result).toHaveLength(2);
  });

  it('returns empty array when nothing matches', () => {
    const result = searchFiles(FIXTURES, { text: 'zzzznotfound' });
    expect(result).toHaveLength(0);
  });

  it('matches partial filenames', () => {
    const result = searchFiles(FIXTURES, { text: 'hol' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('holiday-video');
  });
});
