import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/") // Send back to login if not logged in.
  }

  return (
    <div>
      {children}
    </div>
  )
}

const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  redirect("/")
}

const { data: userData } = await supabase
  .from("users")
  .select("role")
  .eq("email", user.email)
  .single()

if (!userData) {
  redirect("/")
}

// You can now pass userData.role as prop to your components if needed.


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
