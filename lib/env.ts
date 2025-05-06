// Environment variables utility

export const getBaseUrl = () => {
  // Since we're using a subdomain now, we don't need to append /emr
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // For server-side rendering
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "https://emr.luxeclinicgh.com"
}

export const getRedirectUri = () => {
  return `${getBaseUrl()}/auth/google/callback`
}
