import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL || 
                (import.meta as any).env.NEXT_PUBLIC_SUPABASE_URL || 
                'https://placeholder.supabase.co';

let supabaseUrl = rawUrl.trim().replace(/^['"]|['"]$/g, "");
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").trim();
}

const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || 
                         (import.meta as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                         'placeholder').trim().replace(/^['"]|['"]$/g, "");

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
