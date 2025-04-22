"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-96" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <Skeleton className="h-5 w-full" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <Skeleton className="h-4 w-[20%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-4 w-[10%]" />
                <Skeleton className="h-4 w-[10%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-4 w-[10%]" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
