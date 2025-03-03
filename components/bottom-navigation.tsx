"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Search, Heart, History, Settings } from "lucide-react"

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed md:left-0 md:top-0 md:h-full md:w-80 md:flex-col bottom-0 left-0 right-0 bg-background border-t md:border-t-0 md:border-r flex items-center justify-center py-2 z-50">
      <div className="flex md:flex-col w-full max-w-screen-sm justify-around items-center gap-2 px-4 md:px-6 md:py-8">
        <div className="hidden md:flex items-center justify-center w-full mb-6 -mt-16">
          <Link href="/" className="text-3xl font-bold">
            <span className="text-primary">You</span>
            <span className="text-primary">Tok</span>
          </Link>
        </div>
        <Link href="/" className="flex md:flex-row md:py-4 md:px-6 flex-col items-center p-2 md:w-full md:space-x-6 md:hover:bg-accent md:rounded-lg">
          <Home className={`h-6 w-6 md:h-7 md:w-7 ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs md:text-base ${pathname === "/" ? "text-primary" : "text-muted-foreground"} md:block hidden`}>Home</span>
        </Link>
        <Link href="/search" className="flex md:flex-row md:py-4 md:px-6 flex-col items-center p-2 md:w-full md:space-x-6 md:hover:bg-accent md:rounded-lg">
          <Search className={`h-6 w-6 md:h-7 md:w-7 ${pathname === "/search" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs md:text-base ${pathname === "/search" ? "text-primary" : "text-muted-foreground"} md:block hidden`}>Search</span>
        </Link>
        <Link href="/favorites" className="flex md:flex-row md:py-4 md:px-6 flex-col items-center p-2 md:w-full md:space-x-6 md:hover:bg-accent md:rounded-lg">
          <Heart className={`h-6 w-6 md:h-7 md:w-7 ${pathname === "/favorites" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs md:text-base ${pathname === "/favorites" ? "text-primary" : "text-muted-foreground"} md:block hidden`}>Favorites</span>
        </Link>
        <Link href="/history" className="flex md:flex-row md:py-4 md:px-6 flex-col items-center p-2 md:w-full md:space-x-6 md:hover:bg-accent md:rounded-lg">
          <History className={`h-6 w-6 md:h-7 md:w-7 ${pathname === "/history" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs md:text-base ${pathname === "/history" ? "text-primary" : "text-muted-foreground"} md:block hidden`}>History</span>
        </Link>
        <Link href="/settings" className="flex md:flex-row md:py-4 md:px-6 flex-col items-center p-2 md:w-full md:space-x-6 md:hover:bg-accent md:rounded-lg">
          <Settings className={`h-6 w-6 md:h-7 md:w-7 ${pathname === "/settings" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs md:text-base ${pathname === "/settings" ? "text-primary" : "text-muted-foreground"} md:block hidden`}>Settings</span>
        </Link>
      </div>
    </div>
  )
}

