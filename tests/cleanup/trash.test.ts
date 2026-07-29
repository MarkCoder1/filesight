/// <reference types="vitest" />
import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  shell: { trashItem: vi.fn() },
}));

import { executeCleanup } from '../../electron/cleanup/cleanupService';
import { trashFiles } from '../../electron/cleanup/trash';

const { shell } = await import('electron');
const mockTrashItem = vi.mocked(shell.trashItem);

describe('trashFiles', () => {
  beforeEach(() => {
    mockTrashItem.mockReset();
    mockTrashItem.mockResolvedValue(undefined);
  });

  it('trashes all files successfully', async () => {
    const onProgress = vi.fn();
    const files = [
      { path: '/path/file1.txt', name: 'file1.txt' },
      { path: '/path/file2.txt', name: 'file2.txt' },
    ];

    const result = await trashFiles(files, onProgress);

    expect(result.successCount).toBe(2);
    expect(result.failureCount).toBe(0);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].success).toBe(true);
    expect(result.results[1].success).toBe(true);
    expect(mockTrashItem).toHaveBeenCalledTimes(2);
    expect(mockTrashItem).toHaveBeenCalledWith('/path/file1.txt');
    expect(mockTrashItem).toHaveBeenCalledWith('/path/file2.txt');
  });

  it('calls onProgress with correct values (1-indexed)', async () => {
    const onProgress = vi.fn();
    const files = [
      { path: '/a.txt', name: 'a.txt' },
      { path: '/b.txt', name: 'b.txt' },
    ];

    await trashFiles(files, onProgress);

    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 2, 'a.txt');
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 2, 'b.txt');
  });

  it('handles trashItem failures gracefully', async () => {
    mockTrashItem.mockRejectedValueOnce(new Error('EPERM'));

    const result = await trashFiles([{ path: '/bad.txt', name: 'bad.txt' }]);

    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(1);
    expect(result.results[0].success).toBe(false);
    expect(result.results[0].error).toBe('EPERM');
  });

  it('handles multiple files with mixed success', async () => {
    mockTrashItem
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('ENOENT'))
      .mockResolvedValueOnce(undefined);

    const result = await trashFiles([
      { path: '/ok1.txt', name: 'ok1.txt' },
      { path: '/bad.txt', name: 'bad.txt' },
      { path: '/ok2.txt', name: 'ok2.txt' },
    ]);

    expect(result.successCount).toBe(2);
    expect(result.failureCount).toBe(1);
    expect(result.results[0].success).toBe(true);
    expect(result.results[1].success).toBe(false);
    expect(result.results[2].success).toBe(true);
  });

  it('returns empty result for empty input', async () => {
    const result = await trashFiles([]);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(0);
    expect(result.results).toEqual([]);
  });

  it('does not call onProgress for empty input', async () => {
    const onProgress = vi.fn();
    await trashFiles([], onProgress);
    expect(onProgress).not.toHaveBeenCalled();
  });
});

describe('executeCleanup', () => {
  beforeEach(() => {
    mockTrashItem.mockReset();
    mockTrashItem.mockResolvedValue(undefined);
  });

  it('delegates to trashFiles with only path and name', async () => {
    const onProgress = vi.fn();
    const files = [
      { path: '/a.txt', name: 'a.txt', size: 100 },
      { path: '/b.txt', name: 'b.txt', size: 200 },
    ];

    const result = await executeCleanup(files, onProgress);

    expect(result.successCount).toBe(2);
    expect(mockTrashItem).toHaveBeenCalledTimes(2);
  });

  it('passes onProgress through', async () => {
    const onProgress = vi.fn();

    await executeCleanup(
      [
        { path: '/a.txt', name: 'a.txt', size: 100 },
        { path: '/b.txt', name: 'b.txt', size: 200 },
      ],
      onProgress,
    );

    expect(onProgress).toHaveBeenCalledTimes(2);
  });

  it('works without progress callback', async () => {
    const result = await executeCleanup([
      { path: '/a.txt', name: 'a.txt', size: 100 },
    ]);

    expect(result.successCount).toBe(1);
  });
});
