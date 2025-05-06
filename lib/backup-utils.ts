import { createServerSupabaseClient } from "@/lib/supabase"

/**
 * Utility functions for database backups
 */

// Function to create a database backup
export async function createDatabaseBackup() {
  try {
    const supabase = createServerSupabaseClient()
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupFileName = `backup-${timestamp}.json`

    // Get data from all important tables
    const tables = [
      "users",
      "patients",
      "appointments",
      "medical_records",
      "prescriptions",
      "lab_tests",
      "inventory",
      "payments",
      "departments",
      "rooms",
      "clinic_settings",
      "calendar_integration",
    ]

    const backupData: Record<string, any> = {}

    // Fetch data from each table
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*")

      if (error) {
        console.error(`Error fetching data from ${table}:`, error)
        continue
      }

      backupData[table] = data
    }

    // Create backup object with metadata
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        tables: tables,
      },
      data: backupData,
    }

    // Upload backup to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("database-backups")
      .upload(backupFileName, JSON.stringify(backup, null, 2))

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`)
    }

    // Log backup creation
    await supabase.from("backup_logs").insert({
      filename: backupFileName,
      size_bytes: JSON.stringify(backup).length,
      tables_included: tables,
      status: "completed",
      created_by: "system",
    })

    return {
      success: true,
      filename: backupFileName,
      timestamp: backup.metadata.timestamp,
    }
  } catch (error: any) {
    console.error("Backup creation failed:", error)

    // Log backup failure
    const supabase = createServerSupabaseClient()
    await supabase.from("backup_logs").insert({
      status: "failed",
      error_message: error.message,
      created_by: "system",
    })

    return {
      success: false,
      error: error.message,
    }
  }
}

// Function to restore from a backup
export async function restoreFromBackup(backupFileName: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Download backup file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("database-backups")
      .download(backupFileName)

    if (downloadError) {
      throw new Error(`Failed to download backup: ${downloadError.message}`)
    }

    // Parse backup data
    const backupText = await fileData.text()
    const backup = JSON.parse(backupText)

    // Begin transaction for restoration
    // Note: This is a simplified approach. In production, you would want to
    // implement a more sophisticated transaction with proper error handling
    // and rollback capabilities.

    // Log restoration attempt
    await supabase.from("backup_logs").insert({
      filename: backupFileName,
      status: "restoration_started",
      created_by: "system",
    })

    // Restore each table
    for (const [table, data] of Object.entries(backup.data)) {
      // Skip if no data
      if (!Array.isArray(data) || data.length === 0) continue

      // Delete existing data (be careful with this in production!)
      // In a real system, you might want more sophisticated merging logic
      const { error: deleteError } = await supabase.from(table).delete().not("id", "is", null)

      if (deleteError) {
        throw new Error(`Failed to clear table ${table}: ${deleteError.message}`)
      }

      // Insert backup data
      const { error: insertError } = await supabase.from(table).insert(data)

      if (insertError) {
        throw new Error(`Failed to restore data to ${table}: ${insertError.message}`)
      }
    }

    // Log successful restoration
    await supabase.from("backup_logs").insert({
      filename: backupFileName,
      status: "restoration_completed",
      created_by: "system",
    })

    return {
      success: true,
      message: `Successfully restored from backup: ${backupFileName}`,
    }
  } catch (error: any) {
    console.error("Restoration failed:", error)

    // Log restoration failure
    const supabase = createServerSupabaseClient()
    await supabase.from("backup_logs").insert({
      filename: backupFileName || "unknown",
      status: "restoration_failed",
      error_message: error.message,
      created_by: "system",
    })

    return {
      success: false,
      error: error.message,
    }
  }
}

// Function to list available backups
export async function listBackups() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.storage.from("database-backups").list()

    if (error) {
      throw new Error(`Failed to list backups: ${error.message}`)
    }

    return {
      success: true,
      backups: data,
    }
  } catch (error: any) {
    console.error("Failed to list backups:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
