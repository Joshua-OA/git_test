import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function DeploymentLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Skeleton className="h-10 w-[300px] mb-2" />
        <Skeleton className="h-4 w-[400px]" />
      </div>

      <Skeleton className="h-[100px] w-full mb-6" />

      <div className="mb-8">
        <Skeleton className="h-6 w-[200px] mb-2" />
        <Skeleton className="h-2 w-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>

      <Skeleton className="h-10 w-[300px] mb-6" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Skeleton className="h-5 w-[200px] mb-1" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>

            <Skeleton className="h-[1px] w-full" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[150px] mb-1" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-[250px]" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-[150px] mb-1" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-[150px] mb-1" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-[250px]" />
              </div>

              <Skeleton className="h-[1px] w-full" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Skeleton className="h-5 w-[200px] mb-1" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-[150px]" />
        </CardFooter>
      </Card>
    </div>
  )
}
