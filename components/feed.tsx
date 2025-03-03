"use client"

import { useEffect, useState } from "react"
import VideoCard from "@/components/video-card"
import { useVideo } from "@/context/video-context"
import { fetchTrendingVideos, fetchVideosByTopic } from "@/lib/youtube-api"
import { Loader2, TrendingUp, Hash } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function Feed() {
  const { videos, setVideos, settings, updateSettings } = useVideo()
  const [loading, setLoading] = useState(true)
  const [topicVideos, setTopicVideos] = useState<Record<string, any[]>>({})
  const [activeTopicIndex, setActiveTopicIndex] = useState(0)

  // Toggle between trending and topics view
  const handleViewModeChange = (value: string) => {
    if (value) {
      updateSettings({
        ...settings,
        viewMode: value as "trending" | "topics"
      })
    }
  }

  // Load trending videos
  useEffect(() => {
    async function loadTrendingVideos() {
      if (settings.viewMode === "trending") {
        setLoading(true)
        try {
          const trendingVideos = await fetchTrendingVideos(settings.trendingTopic, 1)
          setVideos(trendingVideos)
        } catch (error) {
          console.error("Error fetching trending videos:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadTrendingVideos()
  }, [setVideos, settings.trendingTopic, settings.viewMode])

  // Load topic videos
  useEffect(() => {
    async function loadTopicVideos() {
      if (settings.viewMode === "topics" && settings.userTopics.length > 0) {
        setLoading(true)
        try {
          const activeTopic = settings.userTopics[activeTopicIndex]
          
          // Check if we already have videos for this topic
          if (!topicVideos[activeTopic]) {
            const videos = await fetchVideosByTopic(activeTopic, 1)
            setTopicVideos(prev => ({
              ...prev,
              [activeTopic]: videos
            }))
            setVideos(videos)
          } else {
            setVideos(topicVideos[activeTopic])
          }
        } catch (error) {
          console.error("Error fetching topic videos:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadTopicVideos()
  }, [settings.viewMode, settings.userTopics, activeTopicIndex, topicVideos])

  // Handle topic change
  const handleTopicChange = (index: number) => {
    setActiveTopicIndex(index)
  }

  if (loading) {
    return (
      <div className="w-full p-4 flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      {/* View mode toggle */}
      <div className="mb-4 flex justify-center">
        <ToggleGroup 
          type="single" 
          value={settings.viewMode}
          onValueChange={handleViewModeChange}
          className="justify-start border rounded-md p-1 w-fit"
        >
          <ToggleGroupItem value="trending" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="topics" className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            <span>Topics</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content header */}
      {settings.viewMode === "trending" ? (
        <h2 className="text-lg font-medium mb-4">Trending in {settings.trendingTopic}</h2>
      ) : settings.userTopics.length > 0 ? (
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Your Topics</h2>
          <div className="flex flex-wrap gap-2">
            {settings.userTopics.map((topic, index) => (
              <button
                key={topic}
                onClick={() => handleTopicChange(index)}
                className={`px-3 py-1 rounded-full text-sm ${index === activeTopicIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">Add topics in Settings to see content here</p>
        </div>
      )}

      {/* Video content */}
      {settings.viewMode === "topics" && settings.userTopics.length === 0 ? null : (
        videos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No videos to display</p>
          </div>
        ) : (
          <div className="space-y-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )
      )}
    </div>
  )
}

