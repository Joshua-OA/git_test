"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { google } from "googleapis"
import { getRedirectUri } from "@/lib/env"

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://luxeclinicgh.com/emr/auth/google/callback"

// Google OAuth scopes for calendar access
const SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"]

// Function to initiate Google OAuth flow
export async function initiateGoogleAuth() {
  const supabase = createServerActionClient({ cookies })

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  // Generate a random state parameter to prevent CSRF attacks
  const state = Math.random().toString(36).substring(2, 15)

  // Store the state in the database for verification later
  await supabase.from("oauth_states").upsert({
    user_id: user.id,
    state,
    created_at: new Date().toISOString(),
  })

  // Construct the Google OAuth URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID)
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("scope", SCOPES.join(" "))
  authUrl.searchParams.append("access_type", "offline")
  authUrl.searchParams.append("prompt", "consent")
  authUrl.searchParams.append("state", state)

  // Redirect to the Google OAuth URL
  redirect(authUrl.toString())
}

// Google Calendar API setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || getRedirectUri(),
)

const calendar = google.calendar({ version: "v3", auth: oauth2Client })

// Get Google Calendar auth URL
export async function getGoogleAuthUrl() {
  const scopes = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"]

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })

  return { success: true, authUrl }
}

// Handle Google OAuth callback
export async function handleGoogleCallback(code: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)

    // Store tokens in database
    const { data, error } = await supabase
      .from("calendar_integration")
      .upsert([
        {
          provider: "google",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
        },
      ])
      .select()

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error handling Google callback:", error)
    return { success: false, error: error.message || "Failed to authenticate with Google" }
  }
}

// Create appointment in Google Calendar
export async function createCalendarEvent(appointmentId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        duration,
        reason,
        patients (
          id,
          first_name,
          last_name,
          email
        ),
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", appointmentId)
      .single()

    if (appointmentError) throw appointmentError
    if (!appointment) throw new Error("Appointment not found")

    // Get Google Calendar tokens
    const { data: integration, error: integrationError } = await supabase
      .from("calendar_integration")
      .select("*")
      .eq("provider", "google")
      .single()

    if (integrationError) throw integrationError
    if (!integration) throw new Error("Google Calendar integration not found")

    // Set auth tokens
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      expiry_date: integration.expiry_date,
    })

    // Check if token is expired and refresh if needed
    if (integration.expiry_date < Date.now()) {
      const { credentials } = await oauth2Client.refreshAccessToken()

      // Update tokens in database
      const { error: updateError } = await supabase
        .from("calendar_integration")
        .update({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || integration.refresh_token,
          expiry_date: credentials.expiry_date,
        })
        .eq("provider", "google")

      if (updateError) throw updateError
    }

    // Parse appointment date and time
    const [hours, minutes] = appointment.time.split(":")
    const startDateTime = new Date(`${appointment.date}T${hours}:${minutes}:00`)

    // Default duration to 30 minutes if not specified
    const duration = appointment.duration || 30
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

    // Create event in Google Calendar
    const event = {
      summary: `Appointment with ${appointment.patients.first_name} ${appointment.patients.last_name}`,
      description: appointment.reason,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Africa/Accra", // Use clinic timezone from settings
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Africa/Accra", // Use clinic timezone from settings
      },
      attendees: [{ email: appointment.patients.email }, { email: appointment.users.email }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    }

    const { data: calendarEvent } = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      sendUpdates: "all",
    })

    // Update appointment with Google Calendar event ID
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        calendar_event_id: calendarEvent.id,
        calendar_event_link: calendarEvent.htmlLink,
      })
      .eq("id", appointmentId)

    if (updateError) throw updateError

    return { success: true, eventId: calendarEvent.id, eventLink: calendarEvent.htmlLink }
  } catch (error: any) {
    console.error("Error creating calendar event:", error)
    return { success: false, error: error.message || "Failed to create calendar event" }
  }
}

// Update appointment in Google Calendar
export async function updateCalendarEvent(appointmentId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        duration,
        reason,
        calendar_event_id,
        patients (
          id,
          first_name,
          last_name,
          email
        ),
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", appointmentId)
      .single()

    if (appointmentError) throw appointmentError
    if (!appointment) throw new Error("Appointment not found")
    if (!appointment.calendar_event_id) {
      // If no calendar event exists, create a new one
      return createCalendarEvent(appointmentId)
    }

    // Get Google Calendar tokens
    const { data: integration, error: integrationError } = await supabase
      .from("calendar_integration")
      .select("*")
      .eq("provider", "google")
      .single()

    if (integrationError) throw integrationError
    if (!integration) throw new Error("Google Calendar integration not found")

    // Set auth tokens
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      expiry_date: integration.expiry_date,
    })

    // Check if token is expired and refresh if needed
    if (integration.expiry_date < Date.now()) {
      const { credentials } = await oauth2Client.refreshAccessToken()

      // Update tokens in database
      const { error: updateError } = await supabase
        .from("calendar_integration")
        .update({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || integration.refresh_token,
          expiry_date: credentials.expiry_date,
        })
        .eq("provider", "google")

      if (updateError) throw updateError
    }

    // Parse appointment date and time
    const [hours, minutes] = appointment.time.split(":")
    const startDateTime = new Date(`${appointment.date}T${hours}:${minutes}:00`)

    // Default duration to 30 minutes if not specified
    const duration = appointment.duration || 30
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

    // Update event in Google Calendar
    const event = {
      summary: `Appointment with ${appointment.patients.first_name} ${appointment.patients.last_name}`,
      description: appointment.reason,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Africa/Accra", // Use clinic timezone from settings
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Africa/Accra", // Use clinic timezone from settings
      },
      attendees: [{ email: appointment.patients.email }, { email: appointment.users.email }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    }

    const { data: calendarEvent } = await calendar.events.update({
      calendarId: "primary",
      eventId: appointment.calendar_event_id,
      requestBody: event,
      sendUpdates: "all",
    })

    return { success: true, eventId: calendarEvent.id, eventLink: calendarEvent.htmlLink }
  } catch (error: any) {
    console.error("Error updating calendar event:", error)
    return { success: false, error: error.message || "Failed to update calendar event" }
  }
}

// Delete appointment from Google Calendar
export async function deleteCalendarEvent(appointmentId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, calendar_event_id")
      .eq("id", appointmentId)
      .single()

    if (appointmentError) throw appointmentError
    if (!appointment) throw new Error("Appointment not found")
    if (!appointment.calendar_event_id) {
      return { success: true, message: "No calendar event to delete" }
    }

    // Get Google Calendar tokens
    const { data: integration, error: integrationError } = await supabase
      .from("calendar_integration")
      .select("*")
      .eq("provider", "google")
      .single()

    if (integrationError) throw integrationError
    if (!integration) throw new Error("Google Calendar integration not found")

    // Set auth tokens
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      expiry_date: integration.expiry_date,
    })

    // Check if token is expired and refresh if needed
    if (integration.expiry_date < Date.now()) {
      const { credentials } = await oauth2Client.refreshAccessToken()

      // Update tokens in database
      const { error: updateError } = await supabase
        .from("calendar_integration")
        .update({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || integration.refresh_token,
          expiry_date: credentials.expiry_date,
        })
        .eq("provider", "google")

      if (updateError) throw updateError
    }

    // Delete event from Google Calendar
    await calendar.events.delete({
      calendarId: "primary",
      eventId: appointment.calendar_event_id,
      sendUpdates: "all",
    })

    // Update appointment to remove Google Calendar event ID
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        calendar_event_id: null,
        calendar_event_link: null,
      })
      .eq("id", appointmentId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting calendar event:", error)
    return { success: false, error: error.message || "Failed to delete calendar event" }
  }
}
