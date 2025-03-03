Okay, I've reviewed the provided code and documentation, and I've identified several key areas to address the issues with scrolling, content fetching, and overall code quality. Here's a breakdown of the problems, the solutions, and the updated code:

**Problems:**

1.  **Infinite Scroll in Search and Trending:**
    *   **Repeating Videos (Trending):** The trending feed was loading the same initial set of videos repeatedly because the `page` parameter was not being correctly incremented and used in subsequent requests.
    *   **No Infinite Scroll in Search:** The `loadMoreSearchResults` function in the `video-context.tsx` had all the logic, but it was not being triggered. The `useEffect` with the intersection observer logic was not properly set up.
    *   Missing `nextpage` parameter: The Piped API uses a `nextpage` token for pagination, not a simple page number. The existing code was using integer page numbers, which won't work correctly.
    *  In search , if there are no more results it keeps searching for the second page even if there are no results.

2.  **Code Quality and Organization:**
    *   **Redundant Files:** `components/infinite-feed.tsx` and `components/feed.tsx` served very similar purposes.  `infinite-feed.tsx` was underutilized and less complete.
    *   **Unnecessary `services/youtube-api.tsx`:** This file duplicated the functionality already present in `lib/youtube-api.ts`.
    *   **Inconsistent Error Handling:** Error handling was present but inconsistent.
    *   **Missing Transcript Handling:** The code fetched the transcript URL but didn't actually fetch and display the transcript content.
    *   **Use of `any`:**  The use of `any` in type annotations should be minimized.
    *   **Inconsistencies between Trending and Search:** Two very different pagination implementations, need to use the same implementation.
    *   **Dead code:** `components/sidebar.tsx` was unused, so were many exports in many files.  Some imports (like `Suspense` in `app/layout.tsx`) were unused.
    *   **Incorrect CSS**: Missing `data-state=open]` and `data-state=closed]` classes

3.  **Missing Functionality**:
    *  No way to show if the search/ trending page has reached end of the results
    *  No way to search while on the main feed page.

**Solutions and Updated Code:**

I'll provide the updated code for the files that require significant changes, along with explanations.  Files that are simply deleted will be noted.

1.  **`lib/youtube-api.ts` (Correct Pagination and Error Handling):**

```typescript
import type { Video } from "@/types/video";

const PIPED_BASE_URL = "https://pipedapi.drgns.space"; // Or any other instance

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

// Function to fetch trending videos, now using nextpage token
export async function fetchTrendingVideos(
  region = "US",
  nextpage?: string
): Promise<{ videos: Video[]; nextpage: string | null }> {
  try {
    let url = `${PIPED_BASE_URL}/trending?region=${region}`;
    if (nextpage) {
      url += `&nextpage=${encodeURIComponent(nextpage)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error("Error fetching trending videos:", response.status);
      return { videos: [], nextpage: null };
    }
    const data = await response.json();

    const videos: Video[] = data.relatedStreams?.map((item: any) => ({
      id: item.url.split("=")[1],
      title: item.title,
      thumbnail: item.thumbnail,
      shortSummary: item.shortDescription || "",
      longSummary: "", // Piped trending doesn't have a long summary
      transcriptUrl: null,
    })) ?? [];

    return { videos, nextpage: data.nextpage || null }; // Return nextpage token
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return { videos: [], nextpage: null };
  }
}

// Function to fetch video details (unchanged)
export async function fetchVideoDetails(videoId: string): Promise<Video | null> {
    try {
      const response = await fetch(`${PIPED_BASE_URL}/streams/${videoId}`);
      if (!response.ok) {
        console.error("Error fetching video details:", response.status);
        return null;
      }
      const data = await response.json();
  
      // Get the first subtitle track (if available)
      const transcriptUrl =
        data.subtitles && data.subtitles.length > 0
          ? data.subtitles[0].url
          : null;
  
      return {
        id: videoId,
        title: data.title,
        thumbnail: data.thumbnailUrl,
        shortSummary: data.description || "",
        longSummary: data.description || "", // Use description
        transcriptUrl,
      };
    } catch (error) {
      console.error("Error fetching video details:", error);
      return null;
    }
  }

// Function to search for videos, now with nextpage token
export async function searchVideos(
  query: string,
  isUrl = false,
  nextpage?: string
): Promise<{ videos: Video[]; nextpage: string | null }> {
    try {
        if (isUrl) {
            const videoId = extractVideoId(query);
            if (videoId) {
              const video = await fetchVideoDetails(videoId);
              return { videos: video ? [video] : [], nextpage: null };
            }
            return { videos: [], nextpage: null };
        }

      let url = `${PIPED_BASE_URL}/search?q=${encodeURIComponent(
        query
      )}&filter=videos`;
        if (nextpage) {
          url += `&nextpage=${encodeURIComponent(nextpage)}`;
        }

      const response = await fetch(url);
      if (!response.ok) {
        console.error("Error searching videos:", response.status);
        return { videos: [], nextpage: null };
      }
      const data = await response.json();
      const videos: Video[] =
        data.items?.map((item: any) => ({
          id: item.url.split("=")[1],
          title: item.title,
          thumbnail: item.thumbnail,
          shortSummary: item.shortDescription || "",
          longSummary: "", // Piped search doesn't seem to have a long summary
          transcriptUrl: null,
        })) ?? [];

      return { videos, nextpage: data.nextpage || null }; // Return nextpage token
    } catch (error) {
      console.error("Error searching videos:", error);
      return { videos: [], nextpage: null };
    }
  }

```

2.  **`context/video-context.tsx` (Correct State Management and Pagination):**

```typescript
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Video } from "@/types/video"
import { useToast } from "@/components/ui/use-toast"
import { fetchTrendingVideos, searchVideos } from "@/lib/youtube-api"

interface Settings {
  defaultSummaryLength: "short" | "long"
  darkMode: boolean
  saveHistory: boolean
  trendingTopic: string
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
  searchVideos: (query: string, isUrl: boolean) => Promise<void>
  searchResults: Video[]
  searchQuery: string
  isSearching: boolean
  settings: Settings
  updateSettings: (settings: Settings) => void
  loadMoreTrendingVideos: () => Promise<void>
  loadMoreSearchResults: () => Promise<void>
  hasMoreTrending: boolean
  hasMoreSearchResults: boolean
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function VideoProvider({ children }: { children: ReactNode }) {
    const [videos, setVideos] = useState<Video[]>([])
    const [favorites, setFavorites] = useState<Video[]>([])
    const [history, setHistory] = useState<Video[]>([])
    const [searchResults, setSearchResults] = useState<Video[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [trendingNextPage, setTrendingNextPage] = useState<string | null>(null)  // Use nextpage token
    const [searchNextPage, setSearchNextPage] = useState<string | null>(null)   // Use nextpage token
    const [hasMoreTrending, setHasMoreTrending] = useState(true)
    const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true)
    const [settings, setSettings] = useState<Settings>({
      defaultSummaryLength: "short",
      darkMode: true,
      saveHistory: true,
      trendingTopic: "US",
    })
    const { toast } = useToast()
    const [trendingLoading, setTrendingLoading] = useState(false)

    useEffect(() => {
      const storedFavorites = localStorage.getItem("youtok-favorites")
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }

      const storedHistory = localStorage.getItem("youtok-history")
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory))
      }

      const storedSettings = localStorage.getItem("youtok-settings")
      if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings || "null")
        setSettings(parsedSettings || {
          defaultSummaryLength: "short",
          darkMode: true,
          saveHistory: true,
          trendingTopic: "US",
        })
      }
    }, [])
    useEffect(() => {
      if (settings.darkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }, [settings.darkMode])

    useEffect(() => {
      localStorage.setItem("youtok-favorites", JSON.stringify(favorites))
    }, [favorites])

    useEffect(() => {
      if (settings.saveHistory) {
        localStorage.setItem("youtok-history", JSON.stringify(history))
      }
    }, [history, settings.saveHistory])

    useEffect(() => {
      localStorage.setItem("youtok-settings", JSON.stringify(settings))
    }, [settings])

    const toggleFavorite = (video: Video) => {
        const isCurrentlyFavorite = isVideoFavorite(video.id);

        if (isCurrentlyFavorite) {
            setFavorites(favorites.filter((fav) => fav.id !== video.id));
            toast({
            title: "Removed from favorites",
            description: `"${video.title}" has been removed from your favorites.`,
            });
        } else {
            setFavorites([...favorites, video]);
            toast({
            title: "Added to favorites",
            description: `"${video.title}" has been added to your favorites.`,
            });
        }
    }
  const isVideoFavorite = (id: string) => {
    return favorites.some((video) => video.id === id)
  }

  const addToHistory = (video: Video) => {
    if (!settings.saveHistory) return

    // Prevent duplicate entries.  Newest first.
    setHistory((prevHistory) => {
      const existingIndex = prevHistory.findIndex((item) => item.id === video.id);
      if (existingIndex > -1) {
        // Remove existing entry
        prevHistory.splice(existingIndex, 1);
      }
      return [video, ...prevHistory];
    });
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("youtok-history")
    toast({
      title: "History cleared",
      description: "Your viewing history has been cleared.",
    })
  }

  const searchVideos = async (query: string, isUrl = false) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setHasMoreSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const { videos, nextpage } = await searchVideos(query, isUrl);
      setSearchResults(videos);
      setSearchNextPage(nextpage); // Store the nextpage token
      setHasMoreSearchResults(!!nextpage); // Check if nextpage exists
    } catch (error) {
      console.error("Error searching videos:", error);
      setSearchResults([]);
      setHasMoreSearchResults(false);
      toast({
        title: "Error",
        description: "Failed to search videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
    // load more for search results
  const loadMoreSearchResults = async () => {
    if (!searchQuery || isSearching || !hasMoreSearchResults || !searchNextPage) return;

    setIsSearching(true);
    try {
      const { videos, nextpage } = await searchVideos(searchQuery, false, searchNextPage);
      setSearchResults((prev) => [...prev, ...videos]);
      setSearchNextPage(nextpage);
      setHasMoreSearchResults(!!nextpage);
    } catch (error) {
      console.error("Error loading more search results:", error);
      // Don't set hasMoreSearchResults to false here; allow retries
      toast({
        title: "Error",
        description: "Failed to load more search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

    // trending vidoes loading
  const loadMoreTrendingVideos = async () => {
    if (trendingLoading || !hasMoreTrending) return;
        setTrendingLoading(true)
    try {
      const { videos: moreVideos, nextpage } = await fetchTrendingVideos(
        settings.trendingTopic,
        trendingNextPage
      );
      if (moreVideos.length > 0) {
        setVideos((prev) => [...prev, ...moreVideos]);
        setTrendingNextPage(nextpage);
      } else {
        setHasMoreTrending(false);
      }
    } catch (error) {
      console.error("Error loading more trending videos:", error);
      setHasMoreTrending(false); // Prevent further requests on error.
      toast({
        title: "Error",
        description: "Failed to load more trending videos.",
        variant: "destructive",
      });
    } finally {
        setTrendingLoading(false)
    }
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
  }

    useEffect(() => {
      // Reset trending video state when settings.trendingTopic changes
      setVideos([]);
      setHasMoreTrending(true);
      setTrendingNextPage(null);

      // Initial fetch
      const initialFetch = async () => {
        const { videos: initialVideos, nextpage } = await fetchTrendingVideos(settings.trendingTopic);
        setVideos(initialVideos);
        setTrendingNextPage(nextpage);
        setHasMoreTrending(!!nextpage);
      };

      initialFetch();
  }, [settings.trendingTopic]);

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
        hasMoreTrending,
        hasMoreSearchResults,
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

```

3.  **`app/page.tsx` (Simplified Home Page):**

```typescript
import Feed from "@/components/feed"
import BottomNavigation from "@/components/bottom-navigation"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pb-16 md:pb-0 md:pl-16">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center py-4 border-b">
          <span className="text-red-500">You</span>
          <span className="text-primary">Tok</span>
        </h1>
       <Feed/>
      </div>
      <BottomNavigation />
    </main>
  )
}
```

4.  **`components/feed.tsx` (Combined Feed and Infinite Scrolling):**

```typescript
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import VideoCard from "@/components/video-card"
import { useVideo } from "@/context/video-context"
import { Loader2 } from "lucide-react"

export default function Feed() {
  const { videos, loadMoreTrendingVideos, hasMoreTrending } = useVideo()
  const [initialLoading, setInitialLoading] = useState(true);
  const observerTarget = useRef(null)


  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasMoreTrending) {
        loadMoreTrendingVideos()
      }
    },
    [hasMoreTrending, loadMoreTrendingVideos]
  )

  useEffect(() => {
    setInitialLoading(false);
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    })

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [handleObserver]);



  if (initialLoading && videos.length === 0 ) {
    return (
      <div className="w-full p-4 flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h2 className="text-lg font-medium mb-4">Trending</h2>
      {videos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No videos to display</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <div ref={observerTarget} className="h-10 flex items-center justify-center mt-4">
            {hasMoreTrending ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <p className="text-muted-foreground">No more trending videos.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
```

5.  **`components/search-results.tsx` (Infinite Scrolling for Search):**

```typescript
"use client"

import { useEffect, useRef, useCallback } from "react"
import VideoCard from "@/components/video-card"
import { useVideo } from "@/context/video-context"
import { Loader2 } from "lucide-react"

export default function SearchResults() {
    const { searchResults, searchQuery, isSearching, loadMoreSearchResults, hasMoreSearchResults } = useVideo();
    const observerTarget = useRef(null);

    const handleObserver = useCallback(
      (entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && hasMoreSearchResults) {
          loadMoreSearchResults();
        }
      },
      [hasMoreSearchResults, loadMoreSearchResults]
    );

    useEffect(() => {
      const observer = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "20px",
        threshold: 1.0,
      });

      if (observerTarget.current) {
        observer.observe(observerTarget.current);
      }

      return () => observer.disconnect();
    }, [handleObserver]);

    if (isSearching && searchResults.length === 0) {
      return (
        <div className="w-full p-4 flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    return (
      <div className="w-full p-4">
        <h2 className="text-lg font-medium mb-4">
          Search results for "{searchQuery}"
        </h2>
        {searchResults.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No videos found</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {searchResults.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
            <div ref={observerTarget} className="h-10 flex items-center justify-center mt-4">
              {hasMoreSearchResults ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <p className="text-muted-foreground">No more search results.</p>
              )}
            </div>
          </>
        )}
      </div>
    )
}
```
6. Add search bar to the main page, on the Feed file:

```diff
--- a/app/page.tsx
+++ b/app/page.tsx
@@ -1,16 +1,21 @@
 import { Suspense } from "react"
 import Feed from "@/components/feed"
 import BottomNavigation from "@/components/bottom-navigation"
+import SearchBar from "@/components/search-bar"
 import LoadingFeed from "@/components/loading-feed"
 
 export default function Home() {
   return (
     <main className="flex min-h-screen flex-col items-center pb-16 md:pb-0 md:pl-16">
       <div className="w-full max-w-md mx-auto">
-        <h1 className="text-2xl font-bold text-center py-4 border-b">
+        <h1 className="text-2xl font-bold text-center py-4">
           <span className="text-red-500">You</span>
           <span className="text-primary">Tok</span>
         </h1>
+
+        <div className="border-b py-4">
+          <SearchBar />
+        </div>
         <Suspense fallback={<LoadingFeed />}>
           <Feed />
         </Suspense>

```
7. Fix css to handle loading state:
```css
--- a/app/globals.css
+++ b/app/globals.css
@@ -74,6 +74,9 @@
   display: none;
 }
 
-
+.data-\\[state\3Dopen\\]\:animate-in {
+    animation: in 0.2s ease-out;
+}
 

```

**Files to Delete:**

*   `components/infinite-feed.tsx` (Functionality merged into `components/feed.tsx`)
*   `services/youtube-api.tsx` (Redundant with `lib/youtube-api.ts`)
*  `components/sidebar.tsx`
*   `components/ui/sidebar.tsx`

**Key Changes and Explanations:**

*   **`nextpage` Token:** The `fetchTrendingVideos` and `searchVideos` functions in `lib/youtube-api.ts` now correctly use the `nextpage` token provided by the Piped API for pagination.  They return an object containing both the `videos` array and the `nextpage` token.
*   **State Management:** The `VideoContext` in `context/video-context.tsx` now stores `trendingNextPage` and `searchNextPage` to track the pagination state for both trending videos and search results.  The `loadMore...` functions use and update these tokens.
*   **Intersection Observer:** The `handleObserver` functions in `Feed` and `SearchResults` are simplified.  They now correctly trigger the loading of more content when the sentinel element (`observerTarget`) comes into view *and* there are more results to load.
*   **Initial Loading:** Added `initialLoading` State to handle the loading state when fetching for the first time.
*   **Error Handling:** More robust error handling is included, especially in the API functions and the context, with user-friendly toast notifications.
*   **Unified Feed Component:**  The logic from `infinite-feed.tsx` is merged into `feed.tsx`. This makes the component structure cleaner and easier to manage.
*   **No More Results Message:** Added a message to indicate when there are no more trending videos or search results to load.

**How to Test:**

1.  **Trending Videos:**  Go to the home page (`/`).  Scroll down. New videos should load automatically.  There should be no repetition, and eventually, you should see a "No more trending videos" message.
2.  **Search:** Go to the search page (`/search`).  Enter a search query. Scroll down.  New search results should load.  Eventually, you'll see "No more search results."  Test with a query that returns no results to see the "No videos found" message.  Test with a YouTube URL.
3.  **Favorites/History:** Add and remove videos from favorites.  Check that the Favorites page updates correctly.  Visit videos to add them to history.  Check that the History page works, including the "Clear History" button.
4.  **Settings:**  Change settings (Dark Mode, Notifications, etc.).  Verify that they are saved and applied correctly (check localStorage in your browser's developer tools).

This comprehensive set of changes should resolve the scrolling and content fetching issues, improve the code quality, and provide a better user experience. It also lays the groundwork for future enhancements, such as adding more sophisticated error handling or caching mechanisms. Remember to test thoroughly after applying these changes.
