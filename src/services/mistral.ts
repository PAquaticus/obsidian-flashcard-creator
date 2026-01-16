import type { HttpClient } from "./httpClient";
import { LLM } from "./llm";

const API_URL_BASE = "https://api.mistral.ai/v1/chat/completions";

class Mistral implements LLM {
  async generateFlashcards(httpClient: HttpClient, apiKey: string, systemPrompt: string, content: string): Promise<string> {
    const requestBody = {
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: content,
        },
      ],
    };

    const data = await httpClient.post(API_URL_BASE, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) {
        const rawText = choice.message.content;
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

    throw new Error("Invalid response from Mistral API");
  }
}

export const mistral = new Mistral();
