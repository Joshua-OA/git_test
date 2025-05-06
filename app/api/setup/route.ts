import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Create system_settings table if it doesn't exist
    await supabase.rpc("create_system_settings_table", {})

    // Initialize system settings
    const { data, error } = await supabase.from("system_settings").upsert([
      {
        key: "is_setup_complete",
        value: false,
        description: "Indicates if the initial system setup has been completed",
      },
      {
        key: "version",
        value: "1.0.0",
        description: "Current system version",
      },
      {
        key: "deployment_phase",
        value: "limited",
        description: "Current deployment phase (limited, beta, production)",
      },
    ])

    if (error) throw error

    return NextResponse.json({ success: true, message: "System settings initialized" })
  } catch (error: any) {
    console.error("Error initializing system settings:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize system settings" },
      { status: 500 },
    )
  }
}
