"use client"

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { X, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/context/favorites-context";
import { useHistory } from "@/context/history-context";
import type { Video } from "@/types/video";
import { useSettings } from "@/context/settings-context"; // Import the custom hook
import { fetchVideoDetails } from "@/lib/youtube-api";
import { generateSummary } from "@/lib/ai-summary"; // Import summary generation

interface VideoModalProps {
  video: Video; // Initial video data (might just have id, title, thumbnail)
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const { toggleFavorite, isVideoFavorite } = useFavorites();
  const { addToHistory } = useHistory();
  const { settings } = useSettings(); // Use the custom hook
  const apiKey = settings?.apiKey;
  const [activeTab, setActiveTab] = useState("summary"); // Default to summary tab
  // State to hold the full details fetched from API + generated summary
  const [fullVideoDetails, setFullVideoDetails] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    if (isOpen) {
      const loadAndSummarize = async () => {
        setIsLoading(true);
        setError(null);
        setFullVideoDetails(null); // Clear previous full details

        try {
          // 1. Fetch details (metadata + transcript) from our API route
          const detailsFromApi = await fetchVideoDetails(video.id);

          if (!detailsFromApi) {
            setError("Failed to load video details.");
            setIsLoading(false);
            return;
          }

          // 2. Generate AI Summary if transcript and API key are available
          let aiSummaryResult: string | null = null;
          if (detailsFromApi.transcriptContent && apiKey) {
            console.log(`Modal: Attempting AI summary generation for ${video.id}`);
            try {
               aiSummaryResult = await generateSummary(detailsFromApi.transcriptContent, apiKey);
               console.log(`Modal: AI summary result: ${aiSummaryResult ? 'Success' : 'Failed or null'}`);
            } catch (summaryError) {
               console.error(`Modal: Error generating AI summary for ${video.id}:`, summaryError);
               // Keep aiSummaryResult null, maybe set a specific error message?
            }
          } else {
             console.log(`Modal: Skipping AI summary for ${video.id} (no transcript or API key)`);
          }

          // 3. Combine initial video data, API data, and AI summary
          setFullVideoDetails({
            ...video, // Start with initial data (id, maybe title/thumb)
            ...detailsFromApi, // Add data from API (title, thumb, desc, transcriptContent)
            aiSummary: aiSummaryResult, // Add the generated summary
          });

        } catch (err) {
          console.error("Modal: Error in loadAndSummarize:", err);
          setError("An unexpected error occurred.");
        } finally {
          setIsLoading(false);
        }
      };

      loadAndSummarize();
      addToHistory(video); // Add video to history when modal opens
    } else {
      setFullVideoDetails(null); // Reset details when modal is closed
      setError(null);
    }
    // Dependency array includes apiKey now as summary generation depends on it
  }, [isOpen, video.id, video, apiKey, addToHistory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-lg flex items-center justify-center">
      <div className="glassmorphic-card w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="relative">
          <Image
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            width={640}
            height={360}
            className="w-full h-48 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 glassmorphic text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold line-clamp-2 font-heading">{video.title}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex items-center justify-center rounded-sm glassmorphic hover:bg-white/20 transition-colors duration-200"
              onClick={() => toggleFavorite(video)}
            >
              <Heart
                className={`h-5 w-5 ${
                  isVideoFavorite(video.id) ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span className="sr-only">
                {isVideoFavorite(video.id)
                  ? "Remove from favorites"
                  : "Add to favorites"}
              </span>
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">Error: {error}</p>}

          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading summary..." :
                 fullVideoDetails?.aiSummary ? fullVideoDetails.aiSummary : // Display AI summary if available
                 fullVideoDetails?.transcriptContent ? "Generating summary..." : // Indicate if transcript exists but summary is pending/failed
                 fullVideoDetails?.shortSummary ? `(Description): ${fullVideoDetails.shortSummary}` : // Fallback to description
                 "Summary not available."}
              </p>
            </TabsContent>
            <TabsContent value="transcript" className="mt-4">
              <div className="max-h-60 overflow-y-auto">
                <p className="text-sm whitespace-pre-line">
                  {isLoading ? "Loading transcript..." :
                   fullVideoDetails?.transcriptContent || "Transcript not available."}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onClose} className="w-1/2 mr-2">
              Close
            </Button>
            <Button
              className="w-1/2 ml-2"
              onClick={() =>
                window.open(`https://youtube.com/watch?v=${video.id}`, "_blank")
              }
            >
              <ExternalLink className="h-4 w-4 mr-2 text-white" />
              <span className="text-white">Watch on YouTube</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
