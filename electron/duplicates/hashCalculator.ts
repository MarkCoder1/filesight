import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { access } from 'fs/promises';

export class HashError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
  ) {
    super(message);
    this.name = 'HashError';
  }
}

export function calculateFileHash(
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

    const stream = createReadStream(filePath, {
      highWaterMark: 64 * 1024,
    });

    const onAbort = () => {
      stream.destroy();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

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
      if (err.code === 'ENOENT') {
        reject(new HashError(`File not found: ${filePath}`, filePath));
      } else {
        reject(new HashError(err.message, filePath));
      }
    });
  });
}

export async function validatePath(filePath: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    throw new HashError(`File not accessible: ${filePath}`, filePath);
  }
}
