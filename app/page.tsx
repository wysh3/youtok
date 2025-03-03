import { Suspense } from "react"
import Feed from "@/components/feed"
import BottomNavigation from "@/components/bottom-navigation"
import LoadingFeed from "@/components/loading-feed"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pb-16 md:pb-0 md:pl-16">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center py-4 border-b md:hidden">
          <span className="text-primary">You</span>
          <span className="text-primary">Tok</span>
        </h1>
        <Suspense fallback={<LoadingFeed />}>
          <Feed />
        </Suspense>
      </div>
      <BottomNavigation />
    </main>
  )
}

