import { supabase } from './supabase';
import { compressImage } from './utils';

const BUCKET = 'photos';
const MAX_WIDTH = 1600;
const QUALITY = 0.8;

/**
 * Upload a single photo to Supabase Storage.
 * Returns the public URL, or null on failure.
 */
export async function uploadPhoto(file: File): Promise<string | null> {
  try {
    // Compress first
    const compressed = await compressImage(file, MAX_WIDTH, QUALITY);

    // Generate a unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Convert base64 to blob
    const res = await fetch(compressed);
    const blob = await res.blob();

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, blob, {
        contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        cacheControl: '31536000',
      });

    if (error) {
      console.error('Upload failed:', error);
      // Fallback: return compressed base64
      return compressed;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    return publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    return null;
  }
}

/**
 * Upload multiple photos at once.
 */
export async function uploadPhotos(files: File[]): Promise<string[]> {
  const results = await Promise.allSettled(
    files.map((f) => uploadPhoto(f))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);
}
