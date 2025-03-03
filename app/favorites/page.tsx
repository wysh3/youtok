import BottomNavigation from "@/components/bottom-navigation"
import FavoritesList from "@/components/favorites-list"

export default function FavoritesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center pb-16 md:pb-0 md:pl-16 md:pt-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center py-4 border-b md:hidden">
          <span className="text-primary">You</span>
          <span className="text-primary">Tok</span>
        </h1>
        <FavoritesList />
      </div>
      <BottomNavigation />
    </main>
  )
}

