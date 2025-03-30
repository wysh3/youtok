"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Video } from "@/types/video"
import { useToast } from "@/hooks/use-toast"

interface FavoritesContextType {
  favorites: Video[]
  toggleFavorite: (video: Video) => void
  isVideoFavorite: (id: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Video[]>([])
  const { toast } = useToast()

  // Load favorites from localStorage on initial mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("youtok-favorites")
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (error) {
        console.error("Failed to parse favorites from localStorage", error)
        localStorage.removeItem("youtok-favorites"); // Clear corrupted data
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("youtok-favorites", JSON.stringify(favorites))
  }, [favorites])

  const isVideoFavorite = useCallback((id: string) => {
    return favorites.some((video) => video.id === id)
  }, [favorites])

  const toggleFavorite = useCallback((video: Video) => {
    const isCurrentlyFavorite = isVideoFavorite(video.id)
    if (isCurrentlyFavorite) {
      setFavorites(prevFavorites => prevFavorites.filter((fav) => fav.id !== video.id))
      toast({
        title: "Removed from favorites",
        description: `"${video.title}" has been removed from your favorites.`,
      })
    } else {
      setFavorites(prevFavorites => [...prevFavorites, video])
      toast({
        title: "Added to favorites",
        description: `"${video.title}" has been added to your favorites.`,
      })
    }
  }, [isVideoFavorite, toast]) // Include isVideoFavorite and toast in dependencies

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isVideoFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}