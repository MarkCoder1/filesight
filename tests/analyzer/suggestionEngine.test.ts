import { describe, expect, it } from 'vitest';

import { generateSuggestions } from '../../electron/analyzer/suggestionEngine';
import type { FileEntry } from '../../src/types';

function makeFile(
  name: string,
  extension: string,
  size: number,
  daysAgo: number,
  category: FileEntry['category'] = 'documents',
): FileEntry {
  const now = Date.now();
  return {
    id: name,
    name,
    path: `/test/${name}`,
    extension,
    size,
    createdAt: new Date(now - daysAgo * 86400000),
    modifiedAt: new Date(now - daysAgo * 86400000),
    isDirectory: false,
    category,
  };
}

describe('generateSuggestions', () => {
  it('generates old-installer suggestion for old installer files', () => {
    const files = [makeFile('Chrome.dmg', '.dmg', 200_000_000, 270, 'installers')];
    const suggestions = generateSuggestions(files);
    const installerSuggestion = suggestions.find((s) => s.type === 'old-installers');
    expect(installerSuggestion).toBeDefined();
    expect(installerSuggestion!.fileCount).toBe(1);
    expect(installerSuggestion!.severity).toBe('low');
  });

  it('does not generate old-installer suggestion for recent installer files', () => {
    const files = [makeFile('Chrome.dmg', '.dmg', 200_000_000, 1, 'installers')];
    const suggestions = generateSuggestions(files);
    expect(suggestions.find((s) => s.type === 'old-installers')).toBeUndefined();
  });

  it('generates large-files suggestion for files over 2GB', () => {
    const files = [makeFile('video.mp4', '.mp4', 5_000_000_000, 1, 'videos')];
    const suggestions = generateSuggestions(files);
    const largeSuggestion = suggestions.find((s) => s.type === 'large-files');
    expect(largeSuggestion).toBeDefined();
    expect(largeSuggestion!.fileCount).toBe(1);
  });

  it('does not generate large-files suggestion for files under 2GB', () => {
    const files = [makeFile('small.mp4', '.mp4', 1_000_000_000, 1, 'videos')];
    const suggestions = generateSuggestions(files);
    expect(suggestions.find((s) => s.type === 'large-files')).toBeUndefined();
  });

  it('generates stale-archives suggestion for old archives', () => {
    const files = [makeFile('old.zip', '.zip', 500_000_000, 400, 'archives')];
    const suggestions = generateSuggestions(files);
    const archiveSuggestion = suggestions.find((s) => s.type === 'stale-archives');
    expect(archiveSuggestion).toBeDefined();
    expect(archiveSuggestion!.fileCount).toBe(1);
  });

  it('does not generate stale-archives for recent archives', () => {
    const files = [makeFile('recent.zip', '.zip', 500_000_000, 1, 'archives')];
    const suggestions = generateSuggestions(files);
    expect(suggestions.find((s) => s.type === 'stale-archives')).toBeUndefined();
  });

  it('returns empty array for clean folders', () => {
    const files = [
      makeFile('photo.jpg', '.jpg', 1_000_000, 1, 'images'),
      makeFile('doc.pdf', '.pdf', 500_000, 1, 'documents'),
    ];
    const suggestions = generateSuggestions(files);
    expect(suggestions).toHaveLength(0);
  });

  it('sets severity high when there are many old installers', () => {
    const files = Array.from({ length: 15 }, (_, i) =>
      makeFile(`installer-${i}.exe`, '.exe', 100_000_000, 200, 'installers'),
    );
    const suggestions = generateSuggestions(files);
    const installerSuggestion = suggestions.find((s) => s.type === 'old-installers');
    expect(installerSuggestion!.severity).toBe('high');
  });
});
