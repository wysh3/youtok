import BottomNavigation from "@/components/bottom-navigation"
import FavoritesList from "@/components/favorites-list"

export default function FavoritesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center pb-16 md:pb-0 md:pl-16">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center py-4 border-b">
          <span className="text-red-500">You</span>
          <span className="text-primary">Tok</span>
        </h1>
        <FavoritesList />
      </div>
      <BottomNavigation />
    </main>
  )
}

