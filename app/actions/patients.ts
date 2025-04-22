"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Fetch all patients, ordered by latest
export async function getPatients() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patients:", error)
    return []
  }

  return data || []
}

// Fetch single patient by ID
export async function getPatientById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching patient with ID ${id}:`, error)
    return null
  }

  return data
}

// Create a new patient record
export async function createPatient(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const patientCode = `P${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  const patient = {
    patient_code: patientCode,
    first_name: formData.get("firstName") as string,
    last_name: formData.get("lastName") as string,
    date_of_birth: formData.get("dob") as string,
    gender: formData.get("gender") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    postal_code: formData.get("postalCode") as string,
    status: "active",
  }

  const { data, error } = await supabase
    .from("patients")
    .insert([patient])
    .select()

  if (error) {
    console.error("Error creating patient:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/patients")
  return { success: true, data: data[0] }
}

// Update existing patient record
export async function updatePatient(id: string, formData: FormData) {
  const supabase = createServerSupabaseClient()

  const updatedData = {
    first_name: formData.get("firstName") as string,
    last_name: formData.get("lastName") as string,
    date_of_birth: formData.get("dob") as string,
    gender: formData.get("gender") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    postal_code: formData.get("postalCode") as string,
    status: (formData.get("status") as string) || "active",
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("patients")
    .update(updatedData)
    .eq("id", id)
    .select()

  if (error) {
    console.error(`Error updating patient ${id}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/patients")
  return { success: true, data: data[0] }
}

// Delete patient by ID
export async function deletePatient(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)

  if (error) {
    console.error(`Error deleting patient ${id}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/patients")
  return { success: true }
}
