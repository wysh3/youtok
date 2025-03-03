import type { Video } from "@/types/video";

const PIPED_BASE_URL = "https://pipedapi.drgns.space";

// Function to extract video ID from a YouTube URL
export function extractVideoId(url: string): string | null {
  if (!url) return null;

  // Check if the input is a URL
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    return null;
  }

  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

// Function to fetch trending videos
export async function fetchTrendingVideos(
  region = "US",
  page = 1
): Promise<Video[]> {
  try {
    const response = await fetch(`${PIPED_BASE_URL}/trending?region=${region}&page=${page}`);
    if (!response.ok) {
      console.error("Error fetching trending videos:", response.status);
      return [];
    }
    const data = await response.json();
    
    // Need to adapt the Piped API response to the Video type
    // Need to adapt the Piped API response to the Video type
    const videos: Video[] = data.map((item: any) => ({
      id: item.url.split("=")[1], // Extract video ID from URL
      title: item.title,
      thumbnail: item.thumbnail,
      shortSummary: item.shortDescription || "", // Use shortDescription if available
      longSummary: "", // Piped trending doesn't seem to have a long summary, keep as empty string for now
      transcriptUrl: null,
    }));

    return videos;
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return [];
  }
}

// Function to fetch video details
export async function fetchVideoDetails(videoId: string): Promise<Video | null> {
  try {
    const response = await fetch(`${PIPED_BASE_URL}/streams/${videoId}`);
    if (!response.ok) {
      console.error("Error fetching video details:", response.status);
      return null;
    }
    const data = await response.json();
    console.log("Raw API response:", data); // Log the raw response

    // Get the first subtitle track (if available)
    const transcript =
      data.subtitles && data.subtitles.length > 0
        ? data.subtitles[0].url
        : null;

    return {
      id: videoId,
      title: data.title,
      thumbnail: data.thumbnailUrl,
      shortSummary: data.description || "",
      longSummary: data.description || "", // Use description for summaries
      transcriptUrl: transcript, // Add a transcript URL
    };
  } catch (error) {
    console.error("Error fetching video details:", error);
    return null;
  }
}

// Function to search for videos
export async function searchVideos(query: string, isUrl = false, page = 1): Promise<Video[]> {
    try {
      if (isUrl) {
        const videoId = extractVideoId(query);
        if (videoId) {
          const video = await fetchVideoDetails(videoId);
          return video ? [video] : [];
        }
        return [];
      }
  
      const response = await fetch(
        `${PIPED_BASE_URL}/search?q=${encodeURIComponent(query)}&filter=videos&page=${page}`
      );
      if (!response.ok) {
        console.error("Error searching videos:", response.status);
        return [];
      }
      const data = await response.json();

      const videos: Video[] = data.items.map((item: any) => ({
        id: item.url.split("=")[1], // Extract video ID from URL
        title: item.title,
        thumbnail: item.thumbnail,
        shortSummary: item.shortDescription || "", // Handle null shortDescription
        longSummary: "", // No long summary available
        transcriptUrl: null,
      }));

      return videos;
    } catch (error) {
      console.error("Error searching videos:", error);
      return [];
    }
  }

// Function to fetch videos by topic
export async function fetchVideosByTopic(topic: string, page = 1): Promise<Video[]> {
  try {
    // Using the search endpoint with the topic as the query
    const response = await fetch(
      `${PIPED_BASE_URL}/search?q=${encodeURIComponent(topic)}&filter=videos&page=${page}`
    );
    if (!response.ok) {
      console.error("Error fetching videos by topic:", response.status);
      return [];
    }
    const data = await response.json();

    const videos: Video[] = data.items.map((item: any) => ({
      id: item.url.split("=")[1], // Extract video ID from URL
      title: item.title,
      thumbnail: item.thumbnail,
      shortSummary: item.shortDescription || "", // Handle null shortDescription
      longSummary: "", // No long summary available
      transcriptUrl: null,
    }));

    return videos;
  } catch (error) {
    console.error("Error fetching videos by topic:", error);
    return [];
  }
}

