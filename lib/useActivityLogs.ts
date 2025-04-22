// lib/useActivityLogs.ts
"use client"

import { useEffect, useState } from "react"

export function useActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/activity-logs") // you’ll create this endpoint
        const data = await response.json()
        setLogs(data)
      } catch (error) {
        console.error("Failed to fetch activity logs", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  return { logs, loading }
}
