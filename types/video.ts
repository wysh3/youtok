interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  shortSummary: string;
  longSummary: string;
  transcriptUrl?: string | null; // Add transcript URL (optional)
  transcriptContent?: string | null; // Add fetched transcript content (optional)
  aiSummary?: string | null; // Add AI-generated summary (optional)
}

export type { Video };
