import { type NextRequest, NextResponse } from "next/server"
import { createDatabaseBackup } from "@/lib/backup-utils"
import { applyRetentionPolicy } from "@/lib/backup-retention"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (you might want to add a secret token check here)
    const authHeader = request.headers.get("authorization")
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if there's a scheduled backup due
    const supabase = createServerSupabaseClient()
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    // Get active backup schedules
    const { data: schedules, error } = await supabase.from("backup_schedules").select("*").eq("is_active", true)

    if (error) {
      console.error("Error fetching backup schedules:", error)
      return NextResponse.json({ error: "Failed to fetch backup schedules" }, { status: 500 })
    }

    // Check if any schedule matches the current time
    const matchingSchedules = schedules.filter((schedule) => {
      // For simplicity, we're just checking if the hour and minute match
      return schedule.time === currentTime
    })

    if (matchingSchedules.length === 0) {
      return NextResponse.json({ message: "No backup scheduled for this time" })
    }

    // Create backup for each matching schedule
    const results = []
    for (const schedule of matchingSchedules) {
      const result = await createDatabaseBackup()

      // Update last_run timestamp
      await supabase.from("backup_schedules").update({ last_run: new Date().toISOString() }).eq("id", schedule.id)

      results.push(result)
    }

    // Apply retention policy after creating backups
    const retentionResult = await applyRetentionPolicy()

    return NextResponse.json({
      message: "Scheduled backup(s) completed",
      results,
      retention: retentionResult,
    })
  } catch (error: any) {
    console.error("Error in backup cron job:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
