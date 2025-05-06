#!/usr/bin/env node
/**
 * System Test Utility for Luxe Clinic EHR
 *
 * This script performs a comprehensive test of all system components
 * to ensure everything is working correctly before deployment.
 */

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import { execSync } from "child_process"

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

// Helper functions
function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function error(message: string) {
  log(`❌ ERROR: ${message}`, colors.red)
}

function success(message: string) {
  log(`✅ ${message}`, colors.green)
}

function info(message: string) {
  log(`ℹ️ ${message}`, colors.blue)
}

function warn(message: string) {
  log(`⚠️ ${message}`, colors.yellow)
}

function step(number: number, title: string) {
  log(`\n📋 TEST ${number}: ${title}`, colors.cyan)
  log("─".repeat(50), colors.cyan)
}

// Main test function
async function runSystemTest() {
  log("\n🧪 Starting system test for Luxe Clinic EHR", colors.magenta)
  log("═".repeat(60), colors.magenta)

  // Load environment variables
  const ENV_FILE = ".env.local"
  if (fs.existsSync(ENV_FILE)) {
    info(`Loading environment variables from ${ENV_FILE}`)
    const envContent = fs.readFileSync(ENV_FILE, "utf8")
    const envVars = envContent
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"))
      .reduce(
        (acc, line) => {
          const [key, value] = line.split("=")
          if (key && value) {
            acc[key.trim()] = value.trim()
          }
          return acc
        },
        {} as Record<string, string>,
      )

    // Set environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      process.env[key] = value
    })
  } else {
    warn(`${ENV_FILE} not found. Using existing environment variables.`)
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    error("Supabase URL or service key is missing")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Test 1: Database Connection
  step(1, "Database Connection")
  try {
    info("Testing database connection...")
    const { data, error } = await supabase.from("settings").select("*").limit(1)

    if (error) {
      throw error
    }

    success("Database connection successful")
  } catch (err: any) {
    error(`Database connection failed: ${err.message}`)
    process.exit(1)
  }

  // Test 2: Required Tables
  step(2, "Required Tables")
  const requiredTables = [
    "patients",
    "appointments",
    "medical_records",
    "users",
    "prescriptions",
    "medications",
    "lab_tests",
    "payments",
    "activity_logs",
    "settings",
    "calendar_integration",
  ]

  try {
    info("Checking required tables...")

    const { data: tables, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (error) {
      throw error
    }

    const tableNames = tables.map((t) => t.table_name)
    const missingTables = requiredTables.filter((t) => !tableNames.includes(t))

    if (missingTables.length > 0) {
      warn(`Missing tables: ${missingTables.join(", ")}`)
    } else {
      success("All required tables exist")
    }
  } catch (err: any) {
    error(`Failed to check tables: ${err.message}`)
  }

  // Test 3: Authentication
  step(3, "Authentication")
  try {
    info("Testing authentication...")

    // Check if auth is configured
    const { data: authSettings, error: authError } = await supabase.from("auth.config").select("*")

    if (authError) {
      warn(`Could not verify auth configuration: ${authError.message}`)
    } else {
      success("Authentication is configured")
    }
  } catch (err: any) {
    warn(`Could not verify auth configuration: ${err.message}`)
  }

  // Test 4: Google Calendar Integration
  step(4, "Google Calendar Integration")
  try {
    info("Checking Google Calendar integration...")

    const { data: calendarConfig, error: calendarError } = await supabase
      .from("calendar_integration")
      .select("*")
      .limit(1)

    if (calendarError) {
      throw calendarError
    }

    if (calendarConfig && calendarConfig.length > 0) {
      success("Google Calendar integration is configured")
    } else {
      warn("Google Calendar integration is not configured")
    }
  } catch (err: any) {
    warn(`Could not verify Google Calendar integration: ${err.message}`)
  }

  // Test 5: Backup System
  step(5, "Backup System")
  try {
    info("Checking backup system...")

    // Check if backup tables exist
    const { data: backupTables, error: backupError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .in("table_name", ["backup_logs", "backup_schedules", "backup_retention_policies"])

    if (backupError) {
      throw backupError
    }

    if (backupTables && backupTables.length === 3) {
      success("Backup system tables are configured")
    } else {
      warn(`Backup system tables are partially configured (${backupTables?.length || 0}/3 tables found)`)
    }
  } catch (err: any) {
    warn(`Could not verify backup system: ${err.message}`)
  }

  // Test 6: Build Process
  step(6, "Build Process")
  try {
    info("Testing build process...")
    execSync("npm run build", { stdio: "pipe" })
    success("Build process completed successfully")
  } catch (err: any) {
    error(`Build process failed: ${err.message}`)
  }

  // Test Results
  log("\n📊 System Test Results", colors.magenta)
  log("═".repeat(60), colors.magenta)
  log("The system test has completed. Please review any warnings or errors above.", colors.yellow)
  log("If all tests passed, you are ready to deploy to production.", colors.green)
  log("\nTo deploy, run: npm run deploy", colors.blue)
}

// Run the system test
runSystemTest().catch((err) => {
  error(`System test failed: ${err.message}`)
  process.exit(1)
})
