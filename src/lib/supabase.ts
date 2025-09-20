import { createClient } from "@supabase/supabase-js";

// Use service role key for server-side operations if available, otherwise fall back to anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For server-side operations, we'll use the anon key since there's no service role key
// Note: For production, it's recommended to use a service role key for better security
export const STORAGE_BUCKET = "muktijaya";

// For server-side operations, use the anon key (this will work for public buckets)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
