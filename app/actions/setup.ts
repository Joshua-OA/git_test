"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// Create database tables
export async function setupTables() {
  const supabase = createServerSupabaseClient()

  try {
    // Check if setup has already been completed
    const { data: clinicData } = await supabase.from("clinic_settings").select("id").limit(1)

    if (clinicData && clinicData.length > 0) {
      return { success: false, error: "Setup has already been completed" }
    }

    // Create tables if they don't exist
    // Note: Most tables should be created automatically by Supabase migrations
    // This is a fallback to ensure all required tables exist

    // Create clinic_settings table
    const { error: clinicError } = await supabase.rpc("create_clinic_settings_table")
    if (clinicError) throw clinicError

    // Create departments table
    const { error: deptError } = await supabase.rpc("create_departments_table")
    if (deptError) throw deptError

    // Create rooms table
    const { error: roomsError } = await supabase.rpc("create_rooms_table")
    if (roomsError) throw roomsError

    // Create default departments
    const { error: insertDeptError } = await supabase.from("departments").insert([
      { name: "General Medicine", description: "Primary care and general health services" },
      { name: "Pediatrics", description: "Healthcare for infants, children, and adolescents" },
      { name: "Cardiology", description: "Heart and cardiovascular system care" },
      { name: "Orthopedics", description: "Musculoskeletal system care" },
      { name: "Dermatology", description: "Skin, hair, and nail care" },
      { name: "Obstetrics & Gynecology", description: "Women's health and reproductive care" },
      { name: "Neurology", description: "Nervous system disorders" },
      { name: "Ophthalmology", description: "Eye care and vision health" },
      { name: "ENT", description: "Ear, nose, and throat care" },
      { name: "Psychiatry", description: "Mental health care" },
    ])

    if (insertDeptError) throw insertDeptError

    // Create default rooms
    const { error: insertRoomsError } = await supabase.from("rooms").insert([
      { name: "Room 1", type: "Examination" },
      { name: "Room 2", type: "Examination" },
      { name: "Room 3", type: "Examination" },
      { name: "Room 4", type: "Procedure" },
      { name: "Room 5", type: "Consultation" },
    ])

    if (insertRoomsError) throw insertRoomsError

    return { success: true }
  } catch (error: any) {
    console.error("Error setting up tables:", error)
    return { success: false, error: error.message || "Failed to set up database tables" }
  }
}

// Set up clinic information
export async function setupClinic(formData: FormData) {
  const supabase = createServerSupabaseClient()

  try {
    // Extract data from FormData
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const postalCode = formData.get("postalCode") as string
    const country = formData.get("country") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const website = formData.get("website") as string
    const currency = formData.get("currency") as string
    const timezone = formData.get("timezone") as string
    const logo = formData.get("logo") as File

    let logoUrl = null

    // Upload logo if provided
    if (logo && logo.size > 0) {
      const fileExt = logo.name.split(".").pop()
      const fileName = `clinic-logo-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("clinic-assets")
        .upload(fileName, logo)

      if (uploadError) throw uploadError

      // Get public URL for the uploaded logo
      const { data: urlData } = await supabase.storage.from("clinic-assets").getPublicUrl(fileName)

      logoUrl = urlData.publicUrl
    }

    // Insert clinic settings
    const { data, error } = await supabase
      .from("clinic_settings")
      .insert([
        {
          name,
          address,
          city,
          state,
          postal_code: postalCode,
          country,
          phone,
          email,
          website,
          logo_url: logoUrl,
          currency,
          timezone,
        },
      ])
      .select()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("Error setting up clinic:", error)
    return { success: false, error: error.message || "Failed to set up clinic information" }
  }
}

// Create admin user
export async function setupAdmin(formData: FormData) {
  const supabase = createServerSupabaseClient()

  try {
    // Extract data from FormData
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role,
      },
    })

    if (authError) throw authError

    // Create user record in users table
    if (authData.user) {
      const { error: userError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          role,
        },
      ])

      if (userError) throw userError
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error creating admin user:", error)
    return { success: false, error: error.message || "Failed to create admin user" }
  }
}
