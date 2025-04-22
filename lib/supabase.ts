import { createClient } from "@supabase/supabase-js";

// Client-side singleton
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side factory function
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const serverSupabaseUrl = process.env.SUPABASE_URL!;
  return createClient(serverSupabaseUrl, serviceRoleKey);
};
