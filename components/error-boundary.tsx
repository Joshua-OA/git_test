"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Error caught by error boundary:", error)
      setError(error.error)
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      fallback || (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-red-700">Something went wrong</h2>
            <p className="mb-4 text-red-600">
              {error?.message || "An unexpected error occurred. Please try again later."}
            </p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
