"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Video } from "@/types/video"
import { useToast } from "@/hooks/use-toast"
import { fetchTrendingVideos, fetchVideosByTopic } from "@/lib/youtube-api"
import { useSettings } from "./settings-context" // Import useSettings

interface VideoFeedContextType {
  videos: Video[]
  setVideos: (videos: Video[]) => void // Keep setVideos if needed externally
  loadMoreTrendingVideos: () => Promise<void>
  loadMoreTopicVideos: () => Promise<void>
  hasMoreTrending: boolean
  hasMoreTopicVideos: boolean
  setCurrentTopic: (topic: string) => Promise<void> // Changed to async for loading
  currentTopic: string // Expose currentTopic
  loadInitialFeed: () => Promise<void> // Add function to load initial data
  isLoading: boolean // Add loading state
}

const VideoFeedContext = createContext<VideoFeedContextType | undefined>(undefined)

export function VideoFeedProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentPage, setCurrentPage] = useState(1) // For trending
  const [topicPage, setTopicPage] = useState<Record<string, number>>({}) // Page number per topic
  const [currentTopic, setCurrentTopicInternal] = useState<string>("") // Internal state for topic
  const [hasMoreTrending, setHasMoreTrending] = useState(true)
  const [hasMoreTopicVideos, setHasMoreTopicVideos] = useState(true) // Global flag for current topic
  const [isLoading, setIsLoading] = useState(false) // Loading state for feed

  const { settings } = useSettings() // Get settings
  const { toast } = useToast()

  // Function to load the initial feed based on settings
  const loadInitialFeed = useCallback(async () => {
    setIsLoading(true)
    setVideos([]) // Clear previous videos
    setCurrentPage(1) // Reset trending page
    setTopicPage({}) // Reset topic pages
    setHasMoreTrending(true) // Reset flags
    setHasMoreTopicVideos(true)
    setCurrentTopicInternal("") // Reset internal topic state

    try {
      let initialVideos: Video[] = []
      if (settings.viewMode === "topics" && settings.userTopics.length > 0) {
        const firstTopic = settings.userTopics[0]
        setCurrentTopicInternal(firstTopic) // Set the internal current topic
        initialVideos = await fetchVideosByTopic(firstTopic, 1)
        setTopicPage({ [firstTopic]: 1 }) // Set page for this topic
        setHasMoreTopicVideos(initialVideos.length > 0)
        setHasMoreTrending(false) // Not in trending view
      } else {
        // Default to trending
        initialVideos = await fetchTrendingVideos(settings.trendingTopic, 1)
        setCurrentPage(1)
        setHasMoreTrending(initialVideos.length > 0)
        setHasMoreTopicVideos(false) // Not in topic view
      }
      setVideos(initialVideos)
    } catch (error) {
      console.error("Error loading initial feed:", error)
      toast({ title: "Error", description: "Failed to load initial video feed.", variant: "destructive" })
      setVideos([])
      setHasMoreTrending(false)
      setHasMoreTopicVideos(false)
    } finally {
      setIsLoading(false)
    }
  }, [settings.viewMode, settings.userTopics, settings.trendingTopic, toast])

  // Load initial feed when relevant settings change
  useEffect(() => {
    loadInitialFeed()
  }, [loadInitialFeed]) // Dependency array includes the memoized function

  // Function to explicitly set the current topic and load its videos
  const setCurrentTopic = useCallback(async (topic: string) => {
      if (topic === currentTopic) return // No change

      setIsLoading(true)
      setVideos([]) // Clear previous videos
      setCurrentTopicInternal(topic)
      setTopicPage({ [topic]: 1 }) // Reset page for new topic
      setHasMoreTopicVideos(true) // Assume more initially
      setHasMoreTrending(false) // Ensure trending is marked as inactive

      try {
          const topicVideos = await fetchVideosByTopic(topic, 1)
          setVideos(topicVideos)
          setHasMoreTopicVideos(topicVideos.length > 0)
      } catch (error) {
          console.error(`Error fetching videos for topic ${topic}:`, error)
          toast({ title: "Error", description: `Failed to load videos for ${topic}.`, variant: "destructive" })
          setVideos([])
          setHasMoreTopicVideos(false)
      } finally {
          setIsLoading(false)
      }
  }, [currentTopic, toast]) // Add currentTopic and toast as dependencies


  const loadMoreTrendingVideos = useCallback(async () => {
    if (isLoading || !hasMoreTrending || settings.viewMode !== 'trending') return
    setIsLoading(true)
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
      toast({ title: "Error", description: "Failed to load more videos.", variant: "destructive" })
      setHasMoreTrending(false) // Stop pagination on error
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMoreTrending, settings.trendingTopic, settings.viewMode, currentPage, toast])

  const loadMoreTopicVideos = useCallback(async () => {
    if (isLoading || !hasMoreTopicVideos || !currentTopic || settings.viewMode !== 'topics') return
    setIsLoading(true)
    try {
      const nextPage = (topicPage[currentTopic] || 1) + 1
      const moreVideos = await fetchVideosByTopic(currentTopic, nextPage)
      if (moreVideos.length > 0) {
        setVideos(prev => [...prev, ...moreVideos])
        setTopicPage(prev => ({ ...prev, [currentTopic]: nextPage }))
      } else {
        setHasMoreTopicVideos(false)
      }
    } catch (error) {
      console.error(`Error loading more videos for topic ${currentTopic}:`, error)
      toast({ title: "Error", description: "Failed to load more videos.", variant: "destructive" })
      setHasMoreTopicVideos(false) // Stop pagination on error
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMoreTopicVideos, currentTopic, topicPage, settings.viewMode, toast])

  return (
    <VideoFeedContext.Provider
      value={{
        videos,
        setVideos, // Expose setVideos if direct manipulation is needed elsewhere
        loadMoreTrendingVideos,
        loadMoreTopicVideos,
        hasMoreTrending,
        hasMoreTopicVideos,
        setCurrentTopic, // Use the new async function
        currentTopic,
        loadInitialFeed,
        isLoading,
      }}
    >
      {children}
    </VideoFeedContext.Provider>
  )
}

export function useVideoFeed() {
  const context = useContext(VideoFeedContext)
  if (context === undefined) {
    throw new Error("useVideoFeed must be used within a VideoFeedProvider")
  }
  return context
}