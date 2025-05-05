import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the request is for the setup page
  const isSetupPage = req.nextUrl.pathname === "/setup"

  // Check if setup has been completed
  const { data: clinicData, error: clinicError } = await supabase.from("clinic_settings").select("id").limit(1)

  const setupCompleted = clinicData && clinicData.length > 0

  // If setup is not completed and user is not on setup page, redirect to setup
  if (
    !setupCompleted &&
    !isSetupPage &&
    !req.nextUrl.pathname.startsWith("/_next") &&
    !req.nextUrl.pathname.startsWith("/api")
  ) {
    const setupUrl = req.nextUrl.clone()
    setupUrl.pathname = "/setup"
    return NextResponse.redirect(setupUrl)
  }

  // If setup is completed and user is on setup page, redirect to dashboard
  if (setupCompleted && isSetupPage) {
    const dashboardUrl = req.nextUrl.clone()
    dashboardUrl.pathname = "/"
    return NextResponse.redirect(dashboardUrl)
  }

  // Check authentication for protected routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If there's no session and the user is trying to access a protected route
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/"
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    // Match all routes except for static files, api routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
