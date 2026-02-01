import type { HttpClient } from "./httpClient";
import type { GenerationPayload } from "../types";

export interface LLM {
  generateFlashcards(
    httpClient: HttpClient,
    apiKey: string,
    generationPayload: GenerationPayload,
    content: string,
  ): Promise<string>;
}
