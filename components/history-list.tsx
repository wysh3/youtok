"use client"

import { useVideo } from "@/context/video-context"
import VideoCard from "@/components/video-card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default function HistoryList() {
  const { history, clearHistory } = useVideo()

  if (history.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Your history is empty</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your History</h2>
        <Button variant="outline" size="sm" onClick={clearHistory} className="text-xs">
          <Trash2 className="h-3 w-3 mr-1" />
          Clear History
        </Button>
      </div>
      <div className="space-y-6">
        {history.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}

