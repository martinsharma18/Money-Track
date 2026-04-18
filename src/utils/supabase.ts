import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error(
      'MISSING SUPABASE CREDENTIALS: \n' +
      'Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
      'You can use .env.local.example as a template.'
    );
  }
}

// Note: createClient will still throw if supabaseUrl is empty, 
// so we provide a placeholder to prevent module evaluation crash while developing.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-dont-crash.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

