import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingFeed() {
  return (
    <div className="w-full p-4 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full rounded-lg overflow-hidden shadow-md mb-4 bg-card">
          <Skeleton className="w-full h-48" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

