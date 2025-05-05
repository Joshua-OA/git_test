"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  const supabase = createServerSupabaseClient()

  // Try to sign in with the provided credentials
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If sign in fails, check if we should create a demo user
  if (signInError) {
    // For demo purposes, we'll create a user if they don't exist
    // In a real app, you would return an error
    const role = getRoleFromEmail(email)

    // Create a new user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    })

    if (authError) {
      console.error("Error creating user:", authError)
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    // Create user record in our users table
    if (authUser.user) {
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: authUser.user.id,
          email: authUser.user.email,
          role,
        },
      ])

      if (dbError) {
        console.error("Error creating user record:", dbError)
      }
    }

    // Try signing in again with the newly created user
    const { error: retryError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (retryError) {
      return {
        success: false,
        error: "Failed to authenticate",
      }
    }
  }

  return {
    success: true,
    role: getRoleFromEmail(email),
  }
}

// Helper function to determine role from email (for demo purposes)
function getRoleFromEmail(email: string): string {
  if (email.includes("doctor")) return "doctor"
  if (email.includes("nurse")) return "nurse"
  if (email.includes("lab")) return "lab"
  if (email.includes("pharmacy")) return "pharmacist"
  if (email.includes("admin")) return "admin"
  if (email.includes("reception")) return "reception"
  if (email.includes("cashier")) return "cashier"
  return "reception" // Default role
}

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  cookies().delete("sb-token")
  redirect("/")
}

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserRole() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // First check user metadata for role
  const userRole = user.user_metadata?.role

  if (userRole) {
    return userRole
  }

  // If not in metadata, check the users table
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  return userData?.role || null
}
