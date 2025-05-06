"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href)
      const code = searchParams.get("code")

      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code)
          // Check if setup is complete
          const { data: setupData } = await supabase.from("system_settings").select("is_setup_complete").single()

          if (setupData?.is_setup_complete) {
            router.push("/emr/dashboard")
          } else {
            router.push("/emr/setup")
          }
        } catch (error) {
          console.error("Error exchanging code for session:", error)
          router.push("/emr")
        }
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
      <h2 className="text-xl font-semibold">Authenticating...</h2>
      <p className="text-gray-500">Please wait while we complete the authentication process.</p>
    </div>
  )
}
