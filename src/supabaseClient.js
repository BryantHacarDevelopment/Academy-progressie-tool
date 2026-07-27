import { createClient } from '@supabase/supabase-js';

function cleanEnvironmentValue(value) {
  return String(value ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

function normalizeSupabaseUrl(value) {
  return value
    .replace(/\/(?:rest|auth)\/v1\/?$/i, '')
    .replace(/\/+$/, '');
}

const rawUrl = cleanEnvironmentValue(
  import.meta.env.VITE_SUPABASE_URL
);

const rawKey = cleanEnvironmentValue(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export let supabase = null;
export let supabaseConfigError = '';

if (!rawUrl || !rawKey) {
  supabaseConfigError =
    'Supabase-instellingen ontbreken. Voeg VITE_SUPABASE_URL en ' +
    'VITE_SUPABASE_PUBLISHABLE_KEY toe in Vercel en voer daarna een nieuwe deployment uit.';
} else {
  try {
    const cleanUrl = normalizeSupabaseUrl(rawUrl);
    const parsedUrl = new URL(cleanUrl);

    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      throw new Error('De Supabase-URL moet beginnen met https://');
    }

    if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
      throw new Error(
        'Gebruik alleen de basis-URL van Supabase, zonder /rest/v1 of /auth/v1.'
      );
    }

    supabase = createClient(cleanUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    supabaseConfigError =
      error instanceof Error
        ? `Supabase-configuratiefout: ${error.message}`
        : 'Onbekende Supabase-configuratiefout.';
  }
}
