export const brand = {
  name: 'FileSight',
  tagline: 'Understand your files. Reclaim your space.',
  description:
    'A privacy-first desktop application for understanding and managing your files. Everything runs locally. Nothing is sent to the cloud.',
  version: '1.0.0',
  author: 'FileSight Team',
  repository: 'https://github.com/anomalyco/filesight',
  license: 'MIT',
} as const;

export const colors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontMono: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
  heading: {
    h1: { size: '36px', weight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { size: '24px', weight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { size: '18px', weight: 600, lineHeight: 1.4, letterSpacing: '0em' },
  },
  body: {
    default: { size: '14px', weight: 400, lineHeight: 1.5 },
    small: { size: '12px', weight: 400, lineHeight: 1.5 },
  },
  label: { size: '12px', weight: 500, lineHeight: 1.5, letterSpacing: '0.05em' },
} as const;
