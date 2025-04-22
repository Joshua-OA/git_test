import { createServerSupabaseClient } from "@/lib/supabase"

async function createAdminUser() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email: "evansadenku@gmail.com",
    password: "123123",
    user_metadata: {
      role: "admin",
    },
    email_confirm: true, // skips email confirmation
  })

  if (error) {
    console.error("Error creating user:", error)
  } else {
    console.log("Admin user created:", data.user)
  }
}

createAdminUser()
