import { requireSupabase } from '@/lib/supabase';

const ALLOWED_POSTER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_POSTER_SIZE = 5 * 1024 * 1024;

function safeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-');
}

export async function uploadEventPoster(file: File, organizerId: string) {
  if (!ALLOWED_POSTER_TYPES.includes(file.type)) {
    throw new Error('Please upload JPG, PNG, or WEBP image.');
  }

  if (file.size > MAX_POSTER_SIZE) {
    throw new Error('Poster image must be under 5MB.');
  }

  const supabase = requireSupabase();
  const path = `events/${organizerId}/${Date.now()}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage
    .from('event-posters')
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error('Poster upload failed. Please try again.');
  }

  const { data } = supabase.storage.from('event-posters').getPublicUrl(path);
  return data.publicUrl;
}
