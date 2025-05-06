import { createServerSupabaseClient } from "@/lib/supabase"

type RetentionPolicy = {
  daily: number // days to keep daily backups
  weekly: number // weeks to keep weekly backups
  monthly: number // months to keep monthly backups
  yearly: number // years to keep yearly backups
}

// Default retention policy based on healthcare best practices
const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  daily: 7, // Keep daily backups for 7 days
  weekly: 4, // Keep weekly backups for 4 weeks
  monthly: 12, // Keep monthly backups for 12 months
  yearly: 7, // Keep yearly backups for 7 years (common requirement for medical records)
}

/**
 * Applies the retention policy to clean up old backups
 */
export async function applyRetentionPolicy(customPolicy?: Partial<RetentionPolicy>) {
  try {
    const supabase = createServerSupabaseClient()
    const policy = { ...DEFAULT_RETENTION_POLICY, ...customPolicy }

    // Get all backups
    const { data: backupFiles, error: listError } = await supabase.storage.from("database-backups").list()

    if (listError) {
      throw new Error(`Failed to list backups: ${listError.message}`)
    }

    if (!backupFiles || backupFiles.length === 0) {
      return { success: true, message: "No backups to process" }
    }

    // Parse backup dates and categorize them
    const now = new Date()
    const backups = backupFiles
      .map((file) => {
        // Extract date from filename (assuming format: backup-YYYY-MM-DDTHH-mm-ss.json)
        const dateMatch = file.name.match(/backup-(.+)\.json/)
        const dateStr = dateMatch ? dateMatch[1].replace(/-/g, ":") : null
        const date = dateStr ? new Date(dateStr) : null

        return {
          name: file.name,
          date: date,
          age: date ? Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) : 0, // age in days
        }
      })
      .filter((backup) => backup.date !== null) // Filter out backups with invalid dates

    // Sort backups by date (newest first)
    backups.sort((a, b) => b.date!.getTime() - a.date!.getTime())

    // Identify backups to keep
    const toKeep = new Set<string>()

    // Keep daily backups for the specified period
    const dailyBackups = backups.filter((b) => b.age <= policy.daily)
    dailyBackups.forEach((b) => toKeep.add(b.name))

    // Keep weekly backups (one per week) for the specified period
    const weeklyBackups = identifyWeeklyBackups(backups, policy.weekly)
    weeklyBackups.forEach((b) => toKeep.add(b.name))

    // Keep monthly backups (one per month) for the specified period
    const monthlyBackups = identifyMonthlyBackups(backups, policy.monthly)
    monthlyBackups.forEach((b) => toKeep.add(b.name))

    // Keep yearly backups (one per year) for the specified period
    const yearlyBackups = identifyYearlyBackups(backups, policy.yearly)
    yearlyBackups.forEach((b) => toKeep.add(b.name))

    // Identify backups to delete
    const toDelete = backups.filter((backup) => !toKeep.has(backup.name)).map((backup) => backup.name)

    if (toDelete.length === 0) {
      return { success: true, message: "No backups to delete" }
    }

    // Delete backups in batches (Supabase has limits on batch operations)
    const BATCH_SIZE = 100
    const results = []

    for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
      const batch = toDelete.slice(i, i + BATCH_SIZE)
      const { error: deleteError } = await supabase.storage.from("database-backups").remove(batch)

      if (deleteError) {
        results.push({
          batch: i / BATCH_SIZE + 1,
          success: false,
          error: deleteError.message,
        })
      } else {
        results.push({
          batch: i / BATCH_SIZE + 1,
          success: true,
          count: batch.length,
        })
      }
    }

    // Log the retention policy execution
    await supabase.from("backup_logs").insert({
      action: "retention_policy_applied",
      details: {
        policy,
        kept: toKeep.size,
        deleted: toDelete.length,
        results,
      },
      status: "completed",
      created_by: "system",
    })

    return {
      success: true,
      message: `Retention policy applied. Kept ${toKeep.size} backups, deleted ${toDelete.length} backups.`,
      details: {
        kept: toKeep.size,
        deleted: toDelete.length,
        results,
      },
    }
  } catch (error: any) {
    console.error("Error applying retention policy:", error)

    // Log the failure
    const supabase = createServerSupabaseClient()
    await supabase.from("backup_logs").insert({
      action: "retention_policy_applied",
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

/**
 * Identifies weekly backups to keep (one per week)
 */
function identifyWeeklyBackups(backups: any[], weeksToKeep: number) {
  const weeklyBackups = []
  const now = new Date()
  const seenWeeks = new Set<string>()

  for (const backup of backups) {
    if (backup.age > weeksToKeep * 7) continue // Skip if older than retention period

    const backupDate = backup.date!
    const weekYear = getWeekYear(backupDate)
    const weekKey = `${weekYear.year}-${weekYear.week}`

    if (!seenWeeks.has(weekKey)) {
      seenWeeks.add(weekKey)
      weeklyBackups.push(backup)
    }
  }

  return weeklyBackups
}

/**
 * Identifies monthly backups to keep (one per month)
 */
function identifyMonthlyBackups(backups: any[], monthsToKeep: number) {
  const monthlyBackups = []
  const now = new Date()
  const seenMonths = new Set<string>()

  for (const backup of backups) {
    if (backup.age > monthsToKeep * 30) continue // Skip if older than retention period

    const backupDate = backup.date!
    const monthKey = `${backupDate.getFullYear()}-${backupDate.getMonth()}`

    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey)
      monthlyBackups.push(backup)
    }
  }

  return monthlyBackups
}

/**
 * Identifies yearly backups to keep (one per year)
 */
function identifyYearlyBackups(backups: any[], yearsToKeep: number) {
  const yearlyBackups = []
  const now = new Date()
  const seenYears = new Set<number>()

  for (const backup of backups) {
    if (backup.age > yearsToKeep * 365) continue // Skip if older than retention period

    const backupDate = backup.date!
    const year = backupDate.getFullYear()

    if (!seenYears.has(year)) {
      seenYears.add(year)
      yearlyBackups.push(backup)
    }
  }

  return yearlyBackups
}

/**
 * Gets the ISO week number and year for a date
 */
function getWeekYear(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7)) // Thursday in current week

  const week = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1
  return { week, year: d.getFullYear() }
}
