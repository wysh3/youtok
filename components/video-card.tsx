"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import VideoModal from "@/components/video-modal"
import { useVideo } from "@/context/video-context"
import type { Video } from "@/types/video"

interface VideoCardProps {
  video: Video
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toggleFavorite, isVideoFavorite, addToHistory } = useVideo()

  const handleOpenModal = () => {
    setIsModalOpen(true)
    addToHistory(video)
  }

  return (
    <>
      <div className="w-full rounded-lg overflow-hidden shadow-md mb-4 bg-card glassmorphic-card">
        <div className="relative aspect-video">
          <Image
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            width={400}
            height={225}
            priority
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white h-8 w-8 flex items-center justify-center rounded-sm bg-black/20 backdrop-blur-sm hover:bg-black/25 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(video)
                  }}
                >
                  <Heart className={`h-5 w-5 ${isVideoFavorite(video.id) ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="sr-only">
                    {isVideoFavorite(video.id) ? "Remove from favorites" : "Add to favorites"}
                  </span>
                </Button>
              </div>
              <Button onClick={handleOpenModal} className="w-full mt-2" variant="secondary">
                Read More
              </Button>
            </div>
          </div>
        </div>
      </div>
      <VideoModal video={video} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

