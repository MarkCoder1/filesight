export const APP_NAME = 'FileSight';
export const APP_TAGLINE = 'Understand your files. Reclaim your space.';
export const APP_DESCRIPTION =
  'A privacy-first desktop application for understanding and managing your files. Everything runs locally. Nothing is sent to the cloud.';
export const APP_VERSION = '1.0.0';
export const APP_REPOSITORY = 'https://github.com/anomalyco/filesight';
export const APP_LICENSE = 'MIT';

export const CATEGORY_LABELS: Record<string, string> = {
  images: 'Images',
  videos: 'Videos',
  documents: 'Documents',
  archives: 'Archives',
  installers: 'Installers',
  applications: 'Applications',
  audio: 'Audio',
  code: 'Code',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<string, string> = {
  images: '#3b82f6',
  videos: '#ef4444',
  documents: '#f59e0b',
  archives: '#8b5cf6',
  installers: '#ec4899',
  applications: '#06b6d4',
  audio: '#10b981',
  code: '#6366f1',
  other: '#6b7280',
};

export const SCAN_DEFAULTS = {
  MAX_DEPTH: 10,
  INCLUDE_HIDDEN: false,
};
