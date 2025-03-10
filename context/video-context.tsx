"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Video } from "@/types/video"
import { useToast } from "@/components/ui/use-toast"
import { searchVideosApi } from "@/services/youtube-api"
import { fetchTrendingVideos, fetchVideosByTopic } from "@/lib/youtube-api"

interface Settings {
  defaultSummaryLength: "short" | "long"
  saveHistory: boolean
  trendingTopic: string
  userTopics: string[]
  viewMode: "trending" | "topics"
}

interface VideoContextType {
  videos: Video[]
  setVideos: (videos: Video[]) => void
  favorites: Video[]
  toggleFavorite: (video: Video) => void
  isVideoFavorite: (id: string) => boolean
  history: Video[]
  addToHistory: (video: Video) => void
  clearHistory: () => void
  searchVideos: (query: string, isUrl: boolean, page?: number) => Promise<void>
  searchResults: Video[]
  searchQuery: string
  isSearching: boolean
  settings: Settings
  updateSettings: (settings: Settings) => void
  loadMoreTrendingVideos: () => Promise<void>
  loadMoreSearchResults: () => Promise<void>
  loadMoreTopicVideos: () => Promise<void>
  hasMoreTrending: boolean
  hasMoreSearchResults: boolean
  hasMoreTopicVideos: boolean
  searchHistory: string[]
  addToSearchHistory: (query: string) => void
  clearSearchHistory: () => void
  setCurrentTopic: (topic: string) => void
  setHasMoreTopicVideos: (hasMore: boolean) => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([])
  const [favorites, setFavorites] = useState<Video[]>([])
  const [history, setHistory] = useState<Video[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [topicPage, setTopicPage] = useState<Record<string, number>>({}) // Track page number for each topic
  const [currentTopic, setCurrentTopic] = useState<string>("") // Track current active topic
  const [hasMoreTrending, setHasMoreTrending] = useState(true)
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true)
  const [hasMoreTopicVideos, setHasMoreTopicVideos] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    defaultSummaryLength: "short",
    saveHistory: true,
    trendingTopic: "US",
    userTopics: [],
    viewMode: "trending"
  })
  const { toast } = useToast()

  useEffect(() => {
    const storedFavorites = localStorage.getItem("youtok-favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }

    const storedHistory = localStorage.getItem("youtok-history")
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory))
    }

    const storedSearchHistory = localStorage.getItem("youtok-search-history")
    if (storedSearchHistory) {
      setSearchHistory(JSON.parse(storedSearchHistory))
    }

    const storedSettings = localStorage.getItem("youtok-settings")
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings || "null") || {
        defaultSummaryLength: "short",
        saveHistory: true,
        trendingTopic: "US",
        userTopics: [],
        viewMode: "trending"
      })
    }
  }, [])

  useEffect(() => {
    // Always use dark mode
    document.documentElement.classList.add("dark")
  }, [])

  useEffect(() => {
    localStorage.setItem("youtok-favorites", JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    if (settings.saveHistory) {
      localStorage.setItem("youtok-history", JSON.stringify(history))
      localStorage.setItem("youtok-search-history", JSON.stringify(searchHistory))
    }
  }, [history, searchHistory, settings.saveHistory])

  useEffect(() => {
    localStorage.setItem("youtok-settings", JSON.stringify(settings))
  }, [settings])

  const toggleFavorite = (video: Video) => {
    if (isVideoFavorite(video.id)) {
      setFavorites(favorites.filter((fav) => fav.id !== video.id))
      toast({
        title: "Removed from favorites",
        description: `"${video.title}" has been removed from your favorites.`,
      })
    } else {
      setFavorites([...favorites, video])
      toast({
        title: "Added to favorites",
        description: `"${video.title}" has been added to your favorites.`,
      })
    }
  }

  const isVideoFavorite = (id: string) => {
    return favorites.some((video) => video.id === id)
  }

  const addToHistory = (video: Video) => {
    if (!settings.saveHistory) return

    const filteredHistory = history.filter((item) => item.id !== video.id)
    setHistory([video, ...filteredHistory])
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("youtok-history")
    toast({
      title: "History cleared",
      description: "Your viewing history has been cleared.",
    })
  }

  const addToSearchHistory = (query: string) => {
    if (!settings.saveHistory || !query.trim()) return
    const filteredHistory = searchHistory.filter((item) => item !== query)
    setSearchHistory([query, ...filteredHistory])
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem("youtok-search-history")
    toast({
      title: "Search history cleared",
      description: "Your search history has been cleared.",
    })
  }

  const searchVideos = async (query: string, isUrl = false, page = 1) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      setHasMoreSearchResults(false)
      return
    }
    if (!isUrl) {
      addToSearchHistory(query)
    }

    setIsSearching(true)
    try {
      const results = await searchVideosApi(query, isUrl, page)
      if (page === 1) {
        setSearchResults(results)
      } else {
        // Filter out duplicates by checking video IDs
        setSearchResults(prev => {
          const existingIds = new Set(prev.map(video => video.id))
          const uniqueNewResults = results.filter(video => !existingIds.has(video.id))
          return [...prev, ...uniqueNewResults]
        })
      }
      // Only set hasMoreSearchResults to false if we got zero results
      // This allows infinite scrolling to continue as long as there are results
      setHasMoreSearchResults(results.length > 0)
      setSearchPage(page)
    } catch (error) {
      console.error("Error searching videos:", error)
      if (page === 1) {
        setSearchResults([])
        setHasMoreSearchResults(false)
      }
      toast({
        title: "Error",
        description: "Failed to search videos. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const loadMoreSearchResults = async () => {
    if (!searchQuery || isSearching || !hasMoreSearchResults) return
    await searchVideos(searchQuery, false, searchPage + 1)
  }

  useEffect(() => {
    // Reset pagination state when trending topic changes
    setCurrentPage(1)
    setHasMoreTrending(true)
  }, [settings.trendingTopic])
  
  // Reset topic pagination when user topics change
  useEffect(() => {
    if (settings.viewMode === "topics" && settings.userTopics.length > 0) {
      const activeTopic = settings.userTopics[0]
      setCurrentTopic(activeTopic)
      setTopicPage({})
      setHasMoreTopicVideos(true)
    }
  }, [settings.userTopics])

  const loadMoreTrendingVideos = async () => {
    if (!hasMoreTrending) return
    try {
      const nextPage = currentPage + 1
      const moreVideos = await fetchTrendingVideos(settings.trendingTopic, nextPage)
      if (moreVideos.length > 0) {
        setVideos(prev => [...prev, ...moreVideos])
        setCurrentPage(nextPage)
      } else {
        setHasMoreTrending(false)
      }
    } catch (error) {
      console.error("Error loading more trending videos:", error)
      setHasMoreTrending(false)
    }
  }

  const loadMoreTopicVideos = async () => {
    if (!currentTopic || !hasMoreTopicVideos) return
    
    try {
      const nextPage = (topicPage[currentTopic] || 1) + 1
      const moreVideos = await fetchVideosByTopic(currentTopic, nextPage)
      
      if (moreVideos.length > 0) {
        setVideos(prev => [...prev, ...moreVideos])
        setTopicPage(prev => ({
          ...prev,
          [currentTopic]: nextPage
        }))
      } else {
        setHasMoreTopicVideos(false)
      }
    } catch (error) {
      console.error("Error loading more topic videos:", error)
      setHasMoreTopicVideos(false)
    }
  }

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
  }

  return (
    <VideoContext.Provider
      value={{
        videos,
        setVideos,
        favorites,
        toggleFavorite,
        isVideoFavorite,
        history,
        addToHistory,
        clearHistory,
        searchVideos,
        searchResults,
        searchQuery,
        isSearching,
        settings,
        updateSettings,
        loadMoreTrendingVideos,
        loadMoreSearchResults,
        loadMoreTopicVideos,
        hasMoreTrending,
        hasMoreSearchResults,
        hasMoreTopicVideos,
        searchHistory,
        addToSearchHistory,
        clearSearchHistory,
        setCurrentTopic,
        setHasMoreTopicVideos,
      }}
    >
      {children}
    </VideoContext.Provider>
  )
}

export function useVideo() {
  const context = useContext(VideoContext)
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider")
  }
  return context
}

