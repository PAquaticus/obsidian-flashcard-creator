import type { HttpClient } from "./httpClient";
import { LLM } from "./llm";

const API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

class Gemini implements LLM {
  async generateFlashcards(httpClient: HttpClient, apiKey: string, systemPrompt: string, content: string): Promise<string> {
      const apiUrl = `${API_URL_BASE}?key=${apiKey}`;

      const requestBody = {
          contents: [
              {
                  parts: [
                      { "text": systemPrompt },
                      { "text": content }
                  ]
              }
          ]
      };

      const data = await httpClient.post(apiUrl, {
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
      });

      if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              const rawText = candidate.content.parts[0].text;
              // Extract JSON from markdown code block if present
              const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
              if (jsonMatch && jsonMatch[1]) {
                  return jsonMatch[1];
              }
              return rawText;
          }
      }
      
      if (data.error) {
          throw new Error(data.error.message);
      }

      throw new Error("Invalid response from Gemini API");
  }
}

export const gemini = new Gemini();
