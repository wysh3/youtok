// services/youtube-api.ts
import type { Video } from "@/types/video"
import { searchVideos as searchVideosInternal } from "@/lib/youtube-api" // Import the existing searchVideos function

// Enhanced YouTube API function that handles URLs
export async function searchVideosApi(query: string, isUrl = false, page = 1): Promise<Video[]> {
  return searchVideosInternal(query, isUrl, page)
}

