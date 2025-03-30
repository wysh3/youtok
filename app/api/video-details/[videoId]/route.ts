import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import YTDlpWrap from 'yt-dlp-wrap';

// Helper function to fetch details - similar to the logic previously in lib/youtube-api.ts
async function getVideoDetails(videoId: string) {
    let metadata: any = null;
    let transcriptContent: string | null = null;
    const ytDlpWrap = new YTDlpWrap();

    // Fetch Metadata
    try {
        console.log(`API Route: Attempting metadata fetch for ${videoId}`);
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        metadata = await ytDlpWrap.getVideoInfo(videoUrl);
        console.log(`API Route: Metadata fetched successfully for ${videoId}`);
    } catch (error) {
        console.error(`API Route: Error fetching metadata for ${videoId}:`, error);
        // If metadata fails, we might still want to try getting the transcript,
        // but we'll return an error status later if metadata is crucial.
        // For now, let metadata remain null.
        if (error instanceof Error && (error.message.includes('Video unavailable') || error.message.includes('Unable to extract video data'))) {
            console.log(`API Route: Video ${videoId} is unavailable.`);
            // Throw a specific error or return null/error object if video is unavailable
             throw new Error('Video unavailable');
        }
         // Log other errors but continue to try fetching transcript
         console.error(`API Route: Non-fatal metadata error for ${videoId}.`);
    }

    // Fetch Transcript
    try {
        console.log(`API Route: Attempting transcript fetch for ${videoId}`);
        const transcriptResult = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcriptResult && transcriptResult.length > 0) {
            transcriptContent = transcriptResult.map(item => item.text).join(' ');
            console.log(`API Route: Transcript fetched successfully for ${videoId}. Length: ${transcriptContent?.length}`);
        } else {
            console.log(`API Route: youtube-transcript returned empty for ${videoId}`);
        }
    } catch (libraryError) {
        console.error(`API Route: Error fetching transcript for ${videoId}:`, libraryError);
        if (libraryError instanceof Error && (libraryError.message.includes('No transcript found') || libraryError.message.includes('disabled subtitles'))) {
            console.log(`API Route: Transcript not available/disabled for ${videoId}`);
        } else {
            console.error(`API Route: Unexpected transcript error for ${videoId}.`);
        }
        transcriptContent = null; // Ensure null if error
    }

    // Return combined data (or handle cases where metadata failed)
    if (!metadata && !transcriptContent) {
         // If both failed, definitely an issue
         throw new Error('Failed to fetch both metadata and transcript');
    }

    // Construct the necessary parts of the Video object to return
    // Note: AI Summary is NOT generated here, it will be done client-side
    const bestThumbnail = metadata?.thumbnail; // yt-dlp-wrap provides it directly

    return {
        id: videoId,
        title: metadata?.title || "Title not found",
        thumbnail: bestThumbnail,
        shortSummary: metadata?.description || "", // Use description as short summary
        // longSummary: metadata?.description || "", // Not needed if AI summary is generated client-side
        transcriptContent: transcriptContent,
    };
}


export async function GET(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  const videoId = params.videoId;

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  try {
    const videoDetails = await getVideoDetails(videoId);
    return NextResponse.json(videoDetails);
  } catch (error) {
    console.error(`API Route Error for ${videoId}:`, error);
     let errorMessage = 'Failed to fetch video details';
     let status = 500;
     if (error instanceof Error) {
         if (error.message === 'Video unavailable') {
             errorMessage = 'Video unavailable';
             status = 404;
         } else if (error.message === 'Failed to fetch both metadata and transcript') {
             errorMessage = 'Failed to fetch critical video data';
             status = 500; // Or maybe 404 if it implies video doesn't exist
         }
     }
    return NextResponse.json({ error: errorMessage }, { status: status });
  }
}
