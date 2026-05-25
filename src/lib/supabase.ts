import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnvError =
  !supabaseUrl || !supabaseAnonKey
    ? 'Supabase env missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    : null;

export const supabase = supabaseEnvError
  ? null
  : createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

export function requireSupabase() {
  if (!supabase) {
    throw new Error(supabaseEnvError || 'Supabase is not configured.');
  }
  return supabase;
}
