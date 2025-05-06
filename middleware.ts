import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname from the URL
  const path = req.nextUrl.pathname

  // No need to adjust for basePath anymore since we're using a subdomain

  // Check if the user is authenticated
  if (!session) {
    // If the user is not authenticated and trying to access a protected route
    if (path.startsWith("/dashboard") || path === "/setup" || path.startsWith("/auth/google/callback")) {
      // Allow access to the Google callback route
      if (path.startsWith("/auth/google/callback")) {
        return res
      }

      // Redirect to the login page
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/"
      redirectUrl.search = ""

      return NextResponse.redirect(redirectUrl)
    }
  } else {
    // Check if the system is set up
    const { data: setupData } = await supabase.from("system_settings").select("is_setup_complete").single()

    const isSetupComplete = setupData?.is_setup_complete

    // If the system is not set up and the user is not on the setup page
    if (!isSetupComplete && path !== "/setup" && !path.startsWith("/auth/google/callback")) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/setup"
      return NextResponse.redirect(redirectUrl)
    }

    // If the system is set up and the user is on the setup page
    if (isSetupComplete && path === "/setup") {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is authenticated and on the login page, redirect to dashboard
    if (path === "/") {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/setup", "/", "/auth/google/callback"],
}
