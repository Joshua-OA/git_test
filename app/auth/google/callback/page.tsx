"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleGoogleCallback } from "@/app/actions/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Processing Google authentication...")

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get("code")

        if (!code) {
          throw new Error("No authorization code received from Google")
        }

        const { success, error } = await handleGoogleCallback(code)

        if (!success) {
          throw new Error(error || "Failed to authenticate with Google")
        }

        setStatus("success")
        setMessage("Successfully connected to Google Calendar! You can close this window.")

        // Close window after 3 seconds
        setTimeout(() => {
          window.close()
        }, 3000)
      } catch (err: any) {
        console.error("Google callback error:", err)
        setStatus("error")
        setMessage(err.message || "Failed to connect to Google Calendar")
      }
    }

    processCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "loading" && "Connecting to Google Calendar..."}
            {status === "success" && (
              <>
                <Check className="h-5 w-5 text-green-500" />
                Connection Successful
              </>
            )}
            {status === "error" && (
              <>
                <X className="h-5 w-5 text-red-500" />
                Connection Failed
              </>
            )}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we complete the connection process..."}
            {status === "success" && "Your Google Calendar has been successfully connected."}
            {status === "error" && "There was a problem connecting to Google Calendar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`rounded-md p-4 text-sm ${
              status === "loading"
                ? "bg-blue-50 text-blue-800"
                : status === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
            }`}
          >
            {message}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
