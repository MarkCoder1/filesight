import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { access, stat } from 'fs/promises';

const CHUNK_SIZE = 64 * 1024;
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024;

export class HashError extends Error {
  constructor(message: string, public readonly filePath: string) {
    super(message);
    this.name = 'HashError';
  }
}

export function calculateFullHash(
  filePath: string,
  signal?: AbortSignal,
): Promise<{ hash: string; size: number }> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const hash = createHash('sha256');
    let size = 0;
    const stream = createReadStream(filePath, { highWaterMark: CHUNK_SIZE });

    const onAbort = () => {
      stream.destroy();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal) signal.addEventListener('abort', onAbort, { once: true });

    stream.on('data', (chunk: unknown) => {
      const buf = chunk as Buffer;
      hash.update(buf);
      size += buf.length;
    });

    stream.on('end', () => {
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve({ hash: hash.digest('hex'), size });
    });

    stream.on('error', (err: NodeJS.ErrnoException) => {
      if (signal) signal.removeEventListener('abort', onAbort);
      reject(new HashError(err.code === 'ENOENT' ? `File not found: ${filePath}` : err.message, filePath));
    });
  });
}

export async function calculateChunkHash(
  filePath: string,
  signal?: AbortSignal,
): Promise<{ hash: string; size: number }> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const fileStat = await stat(filePath);
  const size = fileStat.size;

  if (size < LARGE_FILE_THRESHOLD) {
    return calculateFullHash(filePath, signal);
  }

  const hash = createHash('sha256');
  const chunkSize = 1024 * 1024;

  const chunks = [
    { start: 0, label: 'head' },
    { start: Math.floor(size / 2) - chunkSize / 2, label: 'middle' },
    { start: Math.max(0, size - chunkSize), label: 'tail' },
  ];

  for (const chunk of chunks) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const data = await readChunk(filePath, chunk.start, chunkSize);
    hash.update(`${chunk.label}:`);
    hash.update(data);
  }

  return { hash: hash.digest('hex'), size };
}

function readChunk(filePath: string, start: number, length: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, {
      start,
      end: start + length - 1,
      highWaterMark: CHUNK_SIZE,
    });

    const buffers: Buffer[] = [];
    stream.on('data', (chunk: unknown) => buffers.push(chunk as Buffer));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
    stream.on('error', (err: NodeJS.ErrnoException) => reject(new HashError(err.message, filePath)));
  });
}

export async function validateFileAccess(filePath: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    throw new HashError(`File not accessible: ${filePath}`, filePath);
  }
}
