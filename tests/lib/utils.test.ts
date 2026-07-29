import { describe, it, expect } from 'vitest';
import { formatBytes, formatDate, formatRelativeDate, truncatePath, pluralize } from '@/lib/utils';

describe('formatBytes', () => {
  it('returns "0 B" for zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500.0 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(3 * 1024 * 1024 * 1024)).toBe('3.0 GB');
  });

  it('formats terabytes', () => {
    expect(formatBytes(2 * 1024 * 1024 * 1024 * 1024)).toBe('2.0 TB');
  });

  it('handles decimal values', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('handles large exact values', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });
});

describe('formatDate', () => {
  it('formats a date correctly', () => {
    const date = new Date(2024, 0, 15);
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('handles end of month correctly', () => {
    const date = new Date(2024, 5, 30);
    expect(formatDate(date)).toBe('Jun 30, 2024');
  });
});

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 6, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" for today', () => {
    expect(formatRelativeDate(new Date(2024, 6, 15))).toBe('Today');
  });

  it('returns "Yesterday" for yesterday', () => {
    expect(formatRelativeDate(new Date(2024, 6, 14))).toBe('Yesterday');
  });

  it('returns "X days ago" for less than a week', () => {
    expect(formatRelativeDate(new Date(2024, 6, 10))).toBe('5 days ago');
  });

  it('returns "X weeks ago" for less than 30 days', () => {
    expect(formatRelativeDate(new Date(2024, 6, 1))).toBe('2 weeks ago');
  });

  it('returns "X months ago" for less than a year', () => {
    expect(formatRelativeDate(new Date(2024, 3, 15))).toBe('3 months ago');
  });

  it('returns "X years ago" for more than a year', () => {
    expect(formatRelativeDate(new Date(2022, 6, 15))).toBe('2 years ago');
  });
});

describe('truncatePath', () => {
  it('returns short paths unchanged', () => {
    expect(truncatePath('/Users/test/file.txt')).toBe('/Users/test/file.txt');
  });

  it('truncates long paths with ellipsis', () => {
    const longPath = '/Users/testuser/Downloads/very/long/path/to/a/document.pdf';
    const result = truncatePath(longPath, 40);
    expect(result).toMatch(/^\.\.\.\//);
    expect(result).toContain('document.pdf');
    expect(result.length).toBeLessThanOrEqual(43);
  });

  it('handles very long filename by truncating it', () => {
    const longPath = '/a/' + 'x'.repeat(50) + '.txt';
    const result = truncatePath(longPath, 40);
    expect(result).toMatch(/^\.\.\./);
    expect(result.length).toBeLessThanOrEqual(43);
  });

  it('uses default maxLength of 40', () => {
    const path = 'a'.repeat(41);
    expect(truncatePath(path).length).toBeLessThanOrEqual(43);
  });
});

describe('pluralize', () => {
  it('returns singular for count of 1', () => {
    expect(pluralize(1, 'file')).toBe('file');
  });

  it('returns default plural for count of 0', () => {
    expect(pluralize(0, 'file')).toBe('files');
  });

  it('returns default plural for count > 1', () => {
    expect(pluralize(5, 'file')).toBe('files');
  });

  it('uses custom plural when provided', () => {
    expect(pluralize(2, 'category', 'categories')).toBe('categories');
  });

  it('uses custom plural for count of 0', () => {
    expect(pluralize(0, 'index', 'indices')).toBe('indices');
  });
});
