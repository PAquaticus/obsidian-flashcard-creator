import { HttpClient } from "./httpClient";

export interface LLM {
  generateFlashcards(
    httpClient: HttpClient,
    apiKey: string,
    systemPrompt: string,
    content: string,
  ): Promise<string>;
}
