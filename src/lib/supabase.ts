import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables or localStorage for dynamic runtime config
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('pgr_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('pgr_supabase_key') || '' : '';

export const supabaseUrl = localUrl || envUrl;
export const supabaseAnonKey = localKey || envKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-project.supabase.co', 'mock-anon-key');

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pgr_supabase_url', url.trim());
    localStorage.setItem('pgr_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pgr_supabase_url');
    localStorage.removeItem('pgr_supabase_key');
    window.location.reload();
  }
}
