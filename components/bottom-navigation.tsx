"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Search, Heart, History, Settings } from "lucide-react"

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed md:left-0 md:top-0 md:h-full md:w-16 md:flex-col bottom-0 left-0 right-0 bg-background border-t md:border-t-0 md:border-r flex justify-around py-2 z-50">
      <Link href="/" className="flex md:flex-col md:py-4 flex-col items-center p-2">
        <Home className={`h-6 w-6 ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}>Home</span>
      </Link>
      <Link href="/search" className="flex md:flex-col md:py-4 flex-col items-center p-2">
        <Search className={`h-6 w-6 ${pathname === "/search" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs ${pathname === "/search" ? "text-primary" : "text-muted-foreground"}`}>Search</span>
      </Link>
      <Link href="/favorites" className="flex md:flex-col md:py-4 flex-col items-center p-2">
        <Heart className={`h-6 w-6 ${pathname === "/favorites" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs ${pathname === "/favorites" ? "text-primary" : "text-muted-foreground"}`}>
          Favorites
        </span>
      </Link>
      <Link href="/history" className="flex md:flex-col md:py-4 flex-col items-center p-2">
        <History className={`h-6 w-6 ${pathname === "/history" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs ${pathname === "/history" ? "text-primary" : "text-muted-foreground"}`}>History</span>
      </Link>
      <Link href="/settings" className="flex md:flex-col md:py-4 flex-col items-center p-2">
        <Settings className={`h-6 w-6 ${pathname === "/settings" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs ${pathname === "/settings" ? "text-primary" : "text-muted-foreground"}`}>
          Settings
        </span>
      </Link>
    </div>
  )
}

