"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Video } from "@/types/video"
import { useSettings } from "./settings-context" // Import useSettings
import { useToast } from "@/hooks/use-toast"

interface HistoryContextType {
  history: Video[]
  addToHistory: (video: Video) => void
  clearHistory: () => void
  searchHistory: string[]
  addToSearchHistory: (query: string) => void
  clearSearchHistory: () => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<Video[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const { settings } = useSettings() // Get settings
  const { toast } = useToast()

  // Load history from localStorage on initial mount
  useEffect(() => {
    // Only load if saveHistory is enabled (or initially true before settings load)
    // We check settings.saveHistory directly here, assuming settings load quickly.
    // A more robust approach might wait for settings to be loaded.
    if (settings.saveHistory) {
        const storedHistory = localStorage.getItem("youtok-history")
        if (storedHistory) {
            try {
                setHistory(JSON.parse(storedHistory))
            } catch (error) {
                console.error("Failed to parse history from localStorage", error)
                localStorage.removeItem("youtok-history");
            }
        }

        const storedSearchHistory = localStorage.getItem("youtok-search-history")
        if (storedSearchHistory) {
             try {
                setSearchHistory(JSON.parse(storedSearchHistory))
            } catch (error) {
                console.error("Failed to parse search history from localStorage", error)
                localStorage.removeItem("youtok-search-history");
            }
        }
    }
  }, [settings.saveHistory]) // Re-run if saveHistory setting changes (e.g., to load if toggled on)

  // Save history to localStorage whenever it changes, respecting saveHistory setting
  useEffect(() => {
    if (settings.saveHistory) {
      localStorage.setItem("youtok-history", JSON.stringify(history))
    } else {
      // If saving is turned off, remove existing stored data
      localStorage.removeItem("youtok-history")
    }
  }, [history, settings.saveHistory])

  useEffect(() => {
    if (settings.saveHistory) {
      localStorage.setItem("youtok-search-history", JSON.stringify(searchHistory))
    } else {
      // If saving is turned off, remove existing stored data
      localStorage.removeItem("youtok-search-history")
    }
  }, [searchHistory, settings.saveHistory])

  const addToHistory = useCallback((video: Video) => {
    if (!settings.saveHistory) return
    setHistory((prevHistory) => {
      const filteredHistory = prevHistory.filter((item) => item.id !== video.id)
      return [video, ...filteredHistory] // Add to the beginning
    })
  }, [settings.saveHistory])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem("youtok-history") // Explicitly remove on clear
    toast({
      title: "History cleared",
      description: "Your viewing history has been cleared.",
    })
  }, [toast])

  const addToSearchHistory = useCallback((query: string) => {
    if (!settings.saveHistory || !query.trim()) return
    setSearchHistory((prevSearchHistory) => {
      const filteredHistory = prevSearchHistory.filter((item) => item !== query)
      return [query, ...filteredHistory] // Add to the beginning
    })
  }, [settings.saveHistory])

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem("youtok-search-history") // Explicitly remove on clear
    toast({
      title: "Search history cleared",
      description: "Your search history has been cleared.",
    })
  }, [toast])

  return (
    <HistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        searchHistory,
        addToSearchHistory,
        clearSearchHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider")
  }
  return context
}