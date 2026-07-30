import sharp from 'sharp';

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.bmp',
  '.tiff', '.tif', '.webp', '.avif', '.heic',
]);

export function isImageFile(filePath: string): boolean {
  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.has(ext);
}

export async function computePerceptualHash(filePath: string): Promise<string> {
  const buffer = await sharp(filePath)
    .grayscale()
    .resize(9, 8, { fit: 'fill' })
    .raw()
    .toBuffer();

  const pixels = new Uint8Array(buffer);
  let hash = 0n;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = pixels[y * 9 + x];
      const right = pixels[y * 9 + x + 1];
      if (left > right) {
        hash |= (1n << BigInt(y * 8 + x));
      }
    }
  }

  return hash.toString(16).padStart(16, '0');
}

export function hammingDistance(hashA: string, hashB: string): number {
  const a = BigInt('0x' + hashA);
  const b = BigInt('0x' + hashB);
  let xor = a ^ b;
  let distance = 0;

  while (xor > 0n) {
    distance += Number(xor & 1n);
    xor >>= 1n;
  }

  return distance;
}

export function computeImageSimilarity(hashA: string, hashB: string): number {
  const distance = hammingDistance(hashA, hashB);
  return Math.max(0, (64 - distance) / 64);
}

export function getImageResolution(filePath: string): Promise<{ width: number; height: number } | null> {
  return sharp(filePath)
    .metadata()
    .then((meta) => {
      if (meta.width && meta.height) {
        return { width: meta.width, height: meta.height };
      }
      return null;
    })
    .catch(() => null);
}
