"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ExternalLink, RefreshCw, CheckCircle } from "lucide-react"
import { getGoogleAuthUrl } from "@/app/actions/calendar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

// Add this at the beginning of the component
const supabase = createClientComponentClient()

export function CalendarIntegration() {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkIntegration()
  }, [])

  // Add this useEffect to check for existing integration
  useEffect(() => {
    async function checkIntegration() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("calendar_integration").select("id").limit(1)

        if (error) throw error

        setIsConfigured(data && data.length > 0)
      } catch (err) {
        console.error("Error checking calendar integration:", err)
      } finally {
        setLoading(false)
      }
    }

    checkIntegration()
  }, [])

  const checkIntegration = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("calendar_integration").select("*").eq("provider", "google").single()

      if (error) {
        if (error.code === "PGRST116") {
          // No integration found
          setConnected(false)
        } else {
          throw error
        }
      } else {
        setConnected(true)
      }
    } catch (err: any) {
      console.error("Error checking integration:", err)
      setError(err.message || "Failed to check calendar integration")
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const { success, authUrl, error } = await getGoogleAuthUrl()

      if (!success || !authUrl) {
        throw new Error(error || "Failed to get Google authentication URL")
      }

      // Open Google auth in a new window
      window.open(authUrl, "_blank", "width=600,height=700")

      // Poll for integration status
      const checkInterval = setInterval(async () => {
        const { data } = await supabase.from("calendar_integration").select("*").eq("provider", "google").single()

        if (data) {
          clearInterval(checkInterval)
          setConnected(true)
          setLoading(false)
        }
      }, 2000)

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(checkInterval)
        setLoading(false)
      }, 120000)
    } catch (err: any) {
      console.error("Error connecting to Google Calendar:", err)
      setError(err.message || "Failed to connect to Google Calendar")
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase.from("calendar_integration").delete().is("id", "not", null)

      if (error) throw error

      setIsConfigured(false)
      toast({
        title: "Calendar Disconnected",
        description: "Google Calendar has been disconnected successfully",
      })
    } catch (err) {
      console.error("Error disconnecting calendar:", err)
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync appointments with Google Calendar to manage your schedule more effectively
        </CardDescription>
      </CardHeader>
      {/* Update the card content to show different states based on configuration */}
      {/* Replace the existing card content with: */}
      <CardContent className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isConfigured ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p>Google Calendar is connected</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your appointments will be automatically synced with Google Calendar.
            </p>
            <Button variant="outline" onClick={handleDisconnect} className="w-full">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Google Calendar to automatically sync appointments.
            </p>
            <Button onClick={handleConnect} className="w-full">
              Connect Google Calendar
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isConfigured ? (
          <>
            <Button variant="outline" size="sm" className="gap-1" onClick={checkIntegration} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={loading}>
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                Open Google Calendar
              </a>
            </Button>
            <Button size="sm" onClick={handleConnect} disabled={loading}>
              Connect to Google Calendar
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
