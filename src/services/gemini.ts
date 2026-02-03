import type { HttpClient } from "./httpClient";
import type { LLM } from "./llm";
import type { GenerationPayload } from "../types";

const API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const JSON_RESPONSE_FORMAT = `{
    "type": "object",
    "required": [
      "flashcards"
    ],
    "properties": {
      "flashcards": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "q",
            "a"
          ],
          "properties": {
            "a": {
              "type": "string",
              "description": "The answer or explanation for the flashcard"
            },
            "q": {
              "type": "string",
              "description": "The question or prompt for the flashcard"
            },
            "level": {
              "type": "string",
              "description": "Is it foundation, judgment or understanding type"
            }
          },
          "additionalProperties": false
        },
        "description": "A list of flashcards, each containing a question and answer pair"
      }
    },
    "additionalProperties": false
  }`;

class Gemini implements LLM {
  async generateFlashcards(httpClient: HttpClient, apiKey: string, generationPayload: GenerationPayload, content: string): Promise<string> {
      const apiUrl = `${API_URL_BASE}?key=${apiKey}`;

      const systemPrompt = `You are an expert in generating flashcards. Your response should be in the following JSON format: ${JSON_RESPONSE_FORMAT}\n\n${generationPayload}`;

      const requestBody = {
          contents: [
              {
                  parts: [
                      { text: systemPrompt },
                      { text: content }
                  ]
              }
          ],
          generationConfig: {
            responseMimeType: "application/json",
          }
      };

      const data: any = await httpClient.post(apiUrl, {
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
      });

      if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.content?.parts && candidate.content.parts.length > 0) {
              const rawText = candidate.content.parts[0].text;
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
