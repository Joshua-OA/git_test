// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

const BROWSER_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Browser‑side singleton */
export const supabase = createClient(BROWSER_URL, ANON_KEY)

/** For use in server components / layouts */
export function createServerSupabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      // ensure cookies are forwarded
      cookieOptions: {
        name: "sb:token",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  })
}
