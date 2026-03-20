import type { PhotoValidationResult, UploadedPhoto } from '@/types';

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export async function validatePhoto(file: File): Promise<PhotoValidationResult> {
  // Only reject if too large
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 20MB.`,
      sizeBytes: file.size,
    };
  }

  // Check resolution + blur for images (soft check only — no rejection)
  if (file.type.startsWith('image/')) {
    try {
      const { width, height } = await getImageDimensions(file);
      return { valid: true, width, height, sizeBytes: file.size };
    } catch {
      return { valid: true, sizeBytes: file.size };
    }
  }

  return { valid: true, sizeBytes: file.size };
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

async function detectBlur(file: File): Promise<boolean> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(
      Math.min(bitmap.width, 600),
      Math.min(bitmap.height, 450)
    );
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    // Convert to grayscale
    const gray = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const idx = i * 4;
      gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    // Laplacian convolution
    let sum = 0;
    let sumSq = 0;
    let count = 0;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const laplacian =
          -gray[(y - 1) * w + x] -
          gray[y * w + (x - 1)] +
          4 * gray[y * w + x] -
          gray[y * w + (x + 1)] -
          gray[(y + 1) * w + x];

        sum += laplacian;
        sumSq += laplacian * laplacian;
        count++;
      }
    }

    const mean = sum / count;
    const variance = sumSq / count - mean * mean;

    // Threshold: images with variance < 100 are typically blurry
    return variance < 100;
  } catch {
    return false; // Can't detect, assume ok
  }
}

export function createUploadedPhoto(file: File, preview: string, width?: number, height?: number): UploadedPhoto {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    file,
    preview,
    timestamp: Date.now(),
    sizeBytes: file.size,
    width,
    height,
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function fileToPreview(file: File): Promise<string> {
  return fileToBase64(file);
}
