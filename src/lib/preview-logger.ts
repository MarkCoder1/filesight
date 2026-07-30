'use client';

type PreviewMethod = 'readImageFile' | 'readTextFile' | 'readFileBase64' | 'getPreviewType';

interface PreviewLogEntry {
  filePath: string;
  extension: string;
  method: PreviewMethod;
  previewType?: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export function logPreviewError(
  filePath: string,
  extension: string,
  method: PreviewMethod,
  error: unknown,
  previewType?: string,
): void {
  const entry: PreviewLogEntry = {
    filePath,
    extension,
    method,
    previewType,
    success: false,
    error: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
  };
  console.error('[PreviewError]', JSON.stringify(entry));
}

export function logPreviewSuccess(
  filePath: string,
  extension: string,
  method: PreviewMethod,
  previewType?: string,
): void {
  const entry: PreviewLogEntry = {
    filePath,
    extension,
    method,
    previewType,
    success: true,
    timestamp: new Date().toISOString(),
  };
  console.log('[PreviewSuccess]', JSON.stringify(entry));
}
