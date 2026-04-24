import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Custom storage for Capacitor to persist session in native storage
const capacitorStorage = {
  getItem: async (key: string) => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key });
  },
};

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error(
      'MISSING SUPABASE CREDENTIALS: \n' +
      'Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
      'You can use .env.local.example as a template.'
    );
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-dont-crash.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: capacitorStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * Helper to get the correct redirect URL for Supabase Auth
 * Works for both local development, production web, and Capacitor mobile apps
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    'http://localhost:3000/';
  
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

  // Check if running in Capacitor
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
    // For Capacitor, we use the local server address
    // iOS: capacitor://localhost
    // Android: http://localhost
    return window.location.origin + '/';
  }

  return url;
};

