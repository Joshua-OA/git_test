import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function BackupsLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Skeleton className="h-10 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <Skeleton className="h-10 w-[300px] mb-6" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-[150px]" />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-[200px]" />
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <Skeleton className="h-6 w-[200px] mb-4" />
        <div className="border rounded-lg overflow-hidden">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  )
}
