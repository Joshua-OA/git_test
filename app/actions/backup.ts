"use server"

import { createDatabaseBackup, restoreFromBackup, listBackups } from "@/lib/backup-utils"
import { applyRetentionPolicy } from "@/lib/backup-retention"
import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createBackup() {
  try {
    const result = await createDatabaseBackup()
    revalidatePath("/dashboard/settings/backups")
    return result
  } catch (error: any) {
    console.error("Error creating backup:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function getBackups() {
  try {
    const result = await listBackups()
    return result
  } catch (error: any) {
    console.error("Error listing backups:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function restoreBackup(filename: string) {
  try {
    const result = await restoreFromBackup(filename)
    revalidatePath("/dashboard")
    return result
  } catch (error: any) {
    console.error("Error restoring backup:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function scheduleBackup(frequency: string, time: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if a schedule with this frequency already exists
    const { data: existingSchedule, error: queryError } = await supabase
      .from("backup_schedules")
      .select("*")
      .eq("frequency", frequency)
      .single()

    if (queryError && queryError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      throw new Error(`Failed to check existing schedules: ${queryError.message}`)
    }

    if (existingSchedule) {
      // Update existing schedule
      const { error: updateError } = await supabase
        .from("backup_schedules")
        .update({
          time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSchedule.id)

      if (updateError) {
        throw new Error(`Failed to update schedule: ${updateError.message}`)
      }
    } else {
      // Create new schedule
      const { error: insertError } = await supabase.from("backup_schedules").insert({
        frequency,
        time,
        is_active: true,
        created_by: "system",
      })

      if (insertError) {
        throw new Error(`Failed to create schedule: ${insertError.message}`)
      }
    }

    revalidatePath("/dashboard/settings/backups")

    return {
      success: true,
      message: `Backup scheduled for ${frequency} at ${time}`,
    }
  } catch (error: any) {
    console.error("Error scheduling backup:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function applyBackupRetention(policy?: any) {
  try {
    const result = await applyRetentionPolicy(policy)
    revalidatePath("/dashboard/settings/backups")
    return result
  } catch (error: any) {
    console.error("Error applying retention policy:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
