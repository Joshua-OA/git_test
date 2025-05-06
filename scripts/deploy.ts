#!/usr/bin/env node
/**
 * Deployment script for Luxe Clinic EHR
 *
 * This script helps with deploying the EHR system to production.
 * It performs the following tasks:
 * 1. Checks if all required environment variables are set
 * 2. Verifies database connection
 * 3. Creates any missing tables
 * 4. Runs database migrations
 * 5. Initializes system settings
 * 6. Builds the application
 * 7. Deploys to the specified environment
 */

import { execSync } from "child_process"
import fs from "fs"
import { createClient } from "@supabase/supabase-js"

// Configuration
const ENV_FILE = ".env.local"
const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
]

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
  log(`\n📋 STEP ${number}: ${title}`, colors.cyan)
  log("─".repeat(50), colors.cyan)
}

// Main deployment function
async function deploy() {
  log("\n🚀 Starting deployment process for Luxe Clinic EHR", colors.magenta)
  log("═".repeat(60), colors.magenta)

  // Step 1: Check environment variables
  step(1, "Checking environment variables")

  // Load environment variables from .env.local
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

  // Check required environment variables
  const missingVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName])
  if (missingVars.length > 0) {
    error(`Missing required environment variables: ${missingVars.join(", ")}`)
    process.exit(1)
  }
  success("All required environment variables are set")

  // Step 2: Verify database connection
  step(2, "Verifying database connection")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    error("Supabase URL or service key is missing")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

  // Step 3: Build the application
  step(3, "Building the application")

  try {
    info("Running build process...")
    execSync("npm run build", { stdio: "inherit" })
    success("Build completed successfully")
  } catch (err) {
    error("Build failed")
    process.exit(1)
  }

  // Step 4: Deploy to production
  step(4, "Deploying to production")

  try {
    info("Running deployment...")
    execSync("vercel --prod", { stdio: "inherit" })
    success("Deployment completed successfully")
  } catch (err) {
    error("Deployment failed")
    process.exit(1)
  }

  // Deployment complete
  log("\n🎉 Deployment completed successfully!", colors.magenta)
  log("═".repeat(60), colors.magenta)
  info("Your EHR system is now available at: https://luxeclinicgh.com/emr")
}

// Run the deployment
deploy().catch((err) => {
  error(`Deployment failed: ${err.message}`)
  process.exit(1)
})
