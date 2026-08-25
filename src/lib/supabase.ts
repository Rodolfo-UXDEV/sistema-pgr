import { createClient } from '@supabase/supabase-js';

// Credenciais do Projeto Oficial Supabase sistema-pgr (sdtprjzrzcyjzvwkxqzz)
const DEFAULT_SUPABASE_URL = 'https://sdtprjzrzcyjzvwkxqzz.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdHByanpyemN5anp2d2t4cXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MDkyMzMsImV4cCI6MjEwMzE4NTIzM30.7lNE5TRk8ENkIc7KN_RKGoLE35c4TQaBbzfYweZioEw';

const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

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
