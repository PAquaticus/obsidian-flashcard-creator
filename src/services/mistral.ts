import type { HttpClient } from "./httpClient";
import type { LLM } from "./llm";
import type { GenerationPayload } from "../types";

const API_URL_BASE = "https://api.mistral.ai/v1/chat/completions";
const AGENT_API_URL_BASE = "https://api.mistral.ai/v1/agents/completions";

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

export function buildMistralRequest(
  apiKey: string,
  generationPayload: GenerationPayload,
  content: string,
) {
  // biome-ignore lint/suspicious/noExplicitAny: requestBody is dynamically constructed based on generationPayload type.
  let requestBody: any; // Keeping any here for now due to dynamic nature
  let apiUrl = API_URL_BASE;

  const systemPrompt = `You are an expert in generating flashcards. Your response should be in the following JSON format: ${JSON_RESPONSE_FORMAT}`;

  if (typeof generationPayload === "string") {
    requestBody = {
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\n${generationPayload}`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      response_format: { type: "json_object" },
    };
  } else if (
    generationPayload &&
    typeof generationPayload === "object" &&
    generationPayload.agentId
  ) {
    apiUrl = AGENT_API_URL_BASE;
    requestBody = {
      agent_id: generationPayload.agentId,
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
  } else {
    throw new Error("Invalid generation payload for Mistral");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  return { apiUrl, requestBody, headers };
}

class Mistral implements LLM {
  async generateFlashcards(
    httpClient: HttpClient,
    apiKey: string,
    generationPayload: GenerationPayload,
    content: string,
  ): Promise<string> {
    const { apiUrl, requestBody, headers } = buildMistralRequest(
      apiKey,
      generationPayload,
      content,
    );

    const data: any = await httpClient.post(apiUrl, {
      headers,
      body: JSON.stringify(requestBody),
    });

    return parseFlashcardResponseData(data);
  }
}

export const parseFlashcardResponseData = (data: any) => {
  if (data.choices && data.choices.length > 0) {
    const choice = data.choices[0];
    if (choice.message?.content) {
      let content = choice.message.content;
      // Remove the ```json and ``` fences, then escape newlines within string values
      content = content.replace(/^```json\s*|\s*```$/g, "");
      content = escapeNewlinesInJsonString(content);
      return content;
    }
  }

  if (data.error) {
    throw new Error(data.error.message);
  }

  throw new Error("Invalid response from Mistral API");
};

const escapeNewlinesInJsonString = (jsonString: string): string => {
  return jsonString.replace(
    /\"([^\"\\]*(?:\\.[^\"\\]*)*)\"/g,
    (match, group1) => {
      return '"' + group1.replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
    },
  );
};

export const mistral = new Mistral();
