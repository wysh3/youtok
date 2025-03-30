"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import type { Video } from "@/types/video"
import { useToast } from "@/hooks/use-toast"
import { searchVideos as searchVideosFromLib } from "@/lib/youtube-api"
import { useHistory } from "./history-context" // Import useHistory

interface SearchContextType {
  searchResults: Video[]
  searchQuery: string
  isSearching: boolean
  hasMoreSearchResults: boolean
  searchVideos: (query: string, isUrl?: boolean, page?: number) => Promise<void>
  loadMoreSearchResults: () => Promise<void>
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchResults, setSearchResults] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true)
  const { toast } = useToast()
  const { addToSearchHistory } = useHistory() // Get history function

  const searchVideos = useCallback(async (query: string, isUrl = false, page = 1) => {
    setSearchQuery(query) // Update query state regardless of trimming
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setSearchResults([])
      setHasMoreSearchResults(false) // No query means no results
      setSearchPage(1) // Reset page
      return
    }

    // Add to history only if it's a non-URL search
    if (!isUrl) {
      addToSearchHistory(trimmedQuery)
    }

    setIsSearching(true)
    try {
      const results = await searchVideosFromLib(trimmedQuery, isUrl, page)
      if (page === 1) {
        setSearchResults(results)
      } else {
        // Append new results, filtering duplicates
        setSearchResults(prev => {
          const existingIds = new Set(prev.map(video => video.id))
          const uniqueNewResults = results.filter(video => !existingIds.has(video.id))
          return [...prev, ...uniqueNewResults]
        })
      }
      // Update page number *after* successful fetch
      setSearchPage(page)
      // Determine if more results might exist
      setHasMoreSearchResults(results.length > 0) // Assume more if we got results this time
    } catch (error) {
      console.error("Error searching videos:", error)
      // Don't clear results on error for subsequent pages, only on first page error
      if (page === 1) {
          setSearchResults([])
      }
      setHasMoreSearchResults(false) // Stop pagination on error
      toast({
        title: "Search Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }, [toast, addToSearchHistory]) // Add dependencies

  const loadMoreSearchResults = useCallback(async () => {
    if (!searchQuery.trim() || isSearching || !hasMoreSearchResults) return
    // Fetch the next page
    await searchVideos(searchQuery, false, searchPage + 1)
  }, [searchQuery, isSearching, hasMoreSearchResults, searchPage, searchVideos]) // Add dependencies

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        searchQuery,
        isSearching,
        hasMoreSearchResults,
        searchVideos,
        loadMoreSearchResults,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}