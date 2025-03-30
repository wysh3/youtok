import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates a text summary using the Google AI (Gemini) API.
 *
 * @param text The text content to summarize.
 * @param apiKey The user's Google AI API key.
 * @returns A promise that resolves to the generated summary string, or null if an error occurs or inputs are invalid.
 */
export async function generateSummary(text: string, apiKey: string): Promise<string | null> {
  // 1. Input Validation
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    console.warn("Invalid or missing Google AI API key provided.");
    return null;
  }
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn("Invalid or empty text provided for summarization.");
    return null;
  }

  try {
    // 2. API Initialization
    const genAI = new GoogleGenerativeAI(apiKey);

    // 3. Model Selection
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using gemini-2.0-flash as requested

    // 4. Prompt Construction
    const prompt = `Summarize the following text concisely:\n\n${text}`;

    // 5. API Call
    const result = await model.generateContent(prompt);

    // 6. Response Handling
    const response = await result.response;
    const summary = response.text();

    // 7. Return Summary
    return summary;

  } catch (error) {
    // 8. Error Handling
    console.error("Error generating AI summary:", error);
    // Consider more specific error handling based on potential API errors if needed
    return null;
  }
}