interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  shortSummary: string;
  longSummary: string;
  transcriptUrl?: string | null; // Add transcript URL (optional)
}

export type { Video };

