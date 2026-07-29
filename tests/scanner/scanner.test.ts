import path from 'path';
import { describe, expect, it } from 'vitest';

import { scanDirectory } from '../../electron/scanner/scanner';

const FIXTURES_DIR = path.resolve(__dirname, '../../test-fixtures');

describe('scanDirectory', () => {
  it('returns complete scan result', async () => {
    const result = await scanDirectory(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    });

    expect(result.path).toBe(FIXTURES_DIR);
    expect(result.totalFiles).toBe(4);
    expect(result.totalSize).toBeGreaterThan(0);
    expect(result.files).toHaveLength(4);
    expect(result.scannedAt).toBeInstanceOf(Date);
  });

  it('reports progress via callback', async () => {
    const progressUpdates: number[] = [];

    const result = await scanDirectory(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    }, (progress) => {
      if (progress.phase === 'scanning') {
        progressUpdates.push(progress.scannedFiles);
      }
    });

    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(result.totalFiles).toBe(4);
  });

  it('categorizes files correctly', async () => {
    const result = await scanDirectory(FIXTURES_DIR, {
      includeHidden: false,
      followSymlinks: false,
    });

    const categories = result.files.map((f) => f.category);
    expect(categories).toContain('images');
    expect(categories).toContain('code');
    expect(categories).toContain('documents');
  });

  it('handles non-existent directories gracefully', async () => {
    const result = await scanDirectory('/nonexistent/path', {
      includeHidden: false,
      followSymlinks: false,
    });

    expect(result.totalFiles).toBe(0);
    expect(result.files).toHaveLength(0);
    expect(result.totalSize).toBe(0);
  });
});
