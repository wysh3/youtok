"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideo } from "@/context/video-context";
import type { Video } from "@/types/video";
import { fetchVideoDetails } from "@/lib/youtube-api";

interface VideoModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const { toggleFavorite, isVideoFavorite } = useVideo();
  const [activeTab, setActiveTab] = useState("short");
  const [videoDetails, setVideoDetails] = useState<Video | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadVideoDetails = async () => {
        try {
          const details = await fetchVideoDetails(video.id);
          setVideoDetails(details);

          // Fetch transcript if available
          if (details?.transcriptUrl) {
            const transcriptResponse = await fetch(details.transcriptUrl);
            if (transcriptResponse.ok) {
              const transcriptData = await transcriptResponse.text();
              setTranscript(transcriptData);
            } else {
              console.error(
                "Error fetching transcript:",
                transcriptResponse.status
              );
              setTranscript("Transcript not available");
            }
          } else {
            setTranscript("Transcript not available");
          }
        } catch (error) {
          console.error("Error loading video details:", error);
        }
      };

      loadVideoDetails();
    } else {
      setVideoDetails(null); // Reset details when modal is closed
      setTranscript(null);
    }
  }, [isOpen, video.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
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
            className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold line-clamp-2">{video.title}</h2>
            <Button
              variant="ghost"
              size="icon"
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

          <Tabs defaultValue="short" className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="short" onClick={() => setActiveTab("short")}>
                Short Summary
              </TabsTrigger>
              <TabsTrigger value="long" onClick={() => setActiveTab("long")}>
                Detailed Summary
              </TabsTrigger>
              <TabsTrigger value="transcript" onClick={() => setActiveTab("transcript")}>
                Transcript
              </TabsTrigger>
            </TabsList>
            <TabsContent value="short" className="mt-4">
              <p>{videoDetails?.shortSummary || "Loading..."}</p>
            </TabsContent>
            <TabsContent value="long" className="mt-4">
              <p>{videoDetails?.longSummary || "Loading..."}</p>
            </TabsContent>
            <TabsContent value="transcript" className="mt-4">
              <div className="max-h-60 overflow-y-auto">
                <p className="text-sm whitespace-pre-line">
                  {transcript || "Loading transcript..."}
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
              <ExternalLink className="h-4 w-4 mr-2" />
              Watch on YouTube
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

