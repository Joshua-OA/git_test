#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 *
 * This script checks if all required environment variables are set
 * and provides guidance on how to set missing variables.
 */

// Define all required environment variables with descriptions
const requiredVariables = {
  // Database
  POSTGRES_URL: "Main database connection URL",
  POSTGRES_PRISMA_URL: "Prisma-specific database connection URL",
  POSTGRES_URL_NON_POOLING: "Non-pooling database connection for migrations",
  POSTGRES_USER: "Database username",
  POSTGRES_PASSWORD: "Database password",
  POSTGRES_HOST: "Database host",
  POSTGRES_DATABASE: "Database name",

  // Supabase
  SUPABASE_URL: "Supabase API URL",
  NEXT_PUBLIC_SUPABASE_URL: "Public Supabase URL for client-side",
  SUPABASE_ANON_KEY: "Supabase anonymous key",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "Public Supabase anonymous key for client-side",
  SUPABASE_SERVICE_ROLE_KEY: "Supabase service role key for admin operations",
  SUPABASE_JWT_SECRET: "JWT secret for Supabase authentication",

  // Google OAuth
  GOOGLE_CLIENT_ID: "Google OAuth client ID",
  GOOGLE_CLIENT_SECRET: "Google OAuth client secret",
  GOOGLE_REDIRECT_URI: "Google OAuth redirect URI (should be https://luxeclinicgh.com/emr/auth/google/callback)",

  // Cron Jobs
  CRON_SECRET: "Secret token for authenticating cron job requests",

  // Next.js
  NEXT_PUBLIC_BASE_PATH: "Base path for the application (/emr)",
}

// Optional variables with descriptions
const optionalVariables = {
  NODE_ENV: "Environment (should be 'production' for production)",
  VERCEL_URL: "Vercel deployment URL (automatically set by Vercel)",
  VERCEL_ENV: "Vercel environment (automatically set by Vercel)",
  NEXT_PUBLIC_VERCEL_URL: "Public Vercel URL (automatically set by Vercel)",
}

// Check if variables are set
const missingRequired = []
const missingOptional = []

console.log("\n🔍 Checking environment variables for production deployment...\n")

// Check required variables
console.log("Required Environment Variables:")
console.log("==============================")
for (const [key, description] of Object.entries(requiredVariables)) {
  if (process.env[key]) {
    const value =
      key.includes("SECRET") || key.includes("PASSWORD") || key.includes("KEY") ? "********" : process.env[key]
    console.log(`✅ ${key}: ${value}`)
  } else {
    console.log(`❌ ${key}: MISSING - ${description}`)
    missingRequired.push(key)
  }
}

// Check optional variables
console.log("\nOptional Environment Variables:")
console.log("==============================")
for (const [key, description] of Object.entries(optionalVariables)) {
  if (process.env[key]) {
    console.log(`✅ ${key}: ${process.env[key]}`)
  } else {
    console.log(`⚠️ ${key}: NOT SET - ${description}`)
    missingOptional.push(key)
  }
}

// Special checks for production-specific values
console.log("\nProduction-Specific Checks:")
console.log("=========================")

// Check Google Redirect URI
if (process.env.GOOGLE_REDIRECT_URI) {
  const expectedRedirectUri = "https://luxeclinicgh.com/emr/auth/google/callback"
  if (process.env.GOOGLE_REDIRECT_URI === expectedRedirectUri) {
    console.log(`✅ GOOGLE_REDIRECT_URI: Correctly set to ${expectedRedirectUri}`)
  } else {
    console.log(
      `❌ GOOGLE_REDIRECT_URI: Set to ${process.env.GOOGLE_REDIRECT_URI}, but should be ${expectedRedirectUri} for production`,
    )
  }
}

// Check base path
if (process.env.NEXT_PUBLIC_BASE_PATH) {
  if (process.env.NEXT_PUBLIC_BASE_PATH === "/emr") {
    console.log("✅ NEXT_PUBLIC_BASE_PATH: Correctly set to /emr")
  } else {
    console.log(
      `❌ NEXT_PUBLIC_BASE_PATH: Set to ${process.env.NEXT_PUBLIC_BASE_PATH}, but should be /emr for production`,
    )
  }
}

// Check NODE_ENV
if (process.env.NODE_ENV) {
  if (process.env.NODE_ENV === "production") {
    console.log("✅ NODE_ENV: Correctly set to production")
  } else {
    console.log(`⚠️ NODE_ENV: Set to ${process.env.NODE_ENV}, but should be production for production deployment`)
  }
}

// Summary
console.log("\nSummary:")
console.log("========")
if (missingRequired.length === 0) {
  console.log("✅ All required environment variables are set!")
} else {
  console.log(`❌ Missing ${missingRequired.length} required environment variables: ${missingRequired.join(", ")}`)
}

if (missingOptional.length === 0) {
  console.log("✅ All optional environment variables are set!")
} else {
  console.log(`⚠️ Missing ${missingOptional.length} optional environment variables: ${missingOptional.join(", ")}`)
}

// Provide guidance for fixing issues
if (missingRequired.length > 0 || missingOptional.length > 0) {
  console.log("\nHow to fix:")
  console.log("==========")
  console.log("1. Add the missing environment variables to your Vercel project settings")
  console.log("2. Or add them to your .env.production file if deploying manually")
  console.log("3. Run this script again to verify all variables are set")
}

console.log("\n")
