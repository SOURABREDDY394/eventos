import store from '@/data/store';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types';

type SupabaseEventRow = {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  city: string | null;
  poster_url: string | null;
  max_participants: number | null;
  status: Event['status'];
  created_at: string;
};

function normalizeEvent(row: SupabaseEventRow): Event {
  return {
    id: row.id,
    organizer_id: row.organizer_id,
    title: row.title,
    slug: row.slug,
    description: row.description || '',
    category: row.category || 'General',
    date: row.date,
    start_time: row.start_time || undefined,
    end_time: row.end_time || undefined,
    venue: row.venue || undefined,
    city: row.city || undefined,
    poster_url: row.poster_url,
    max_participants: row.max_participants || 100,
    status: row.status,
    created_at: row.created_at,
  };
}

export async function syncPublishedEventsFromSupabase() {
  if (!supabase) return store.getEvents();

  const { data, error } = await supabase
    .from('events')
    .select('id, organizer_id, title, slug, description, category, date, start_time, end_time, venue, city, poster_url, max_participants, status, created_at')
    .eq('status', 'published')
    .order('date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  (data || []).forEach((row) => {
    store.upsertEvent(normalizeEvent(row as SupabaseEventRow));
  });

  return store.getEvents();
}

export async function syncEventBySlugFromSupabase(slug: string) {
  if (!supabase || !slug) return store.getEventBySlug(slug);

  const { data, error } = await supabase
    .from('events')
    .select('id, organizer_id, title, slug, description, category, date, start_time, end_time, venue, city, poster_url, max_participants, status, created_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return store.upsertEvent(normalizeEvent(data as SupabaseEventRow));
  }

  return undefined;
}
