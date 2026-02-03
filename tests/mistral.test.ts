import "dotenv/config";
import { describe, it, expect } from "vitest";
import { buildMistralRequest } from "../src/services/mistral";
import { AxiosHttpClient } from "./AxiosHttpClient";

const parseAndValidateFlashcards = (response: string) => {
  try {
    const flashcards = JSON.parse(
      response.replace(/^```json\s*|\s*```$/g, "").replace("\n", ""),
    );
    expect(Array.isArray(flashcards.flashcards)).toBe(true);
    expect(flashcards.flashcards.length).toBeGreaterThan(0);
    flashcards.flashcards.forEach((card: any) => {
      expect(card).toHaveProperty("q");
      expect(card).toHaveProperty("a");
    });
    return flashcards;
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    expect.fail("Response was not valid JSON.");
  }
};

describe("Mistral Service Integration", () => {
  const apiKey = process.env.MISTRAL_API_KEY;
  const agentId = process.env.MISTRAL_AGENT_ID;
  const httpClient = new AxiosHttpClient();

  const itif = apiKey ? it : it.skip;
  const itifAgent = apiKey && agentId ? it : it.skip;

  itif(
    "should generate flashcards using a master prompt",
    async () => {
      const generationPayload =
        "Generate 2 flashcards in JSON format with 'q' and 'a' keys from the following text:";
      const content =
        "The capital of France is Paris. The mitochondria is the powerhouse of the cell.";

      const { apiUrl, requestBody, headers } = buildMistralRequest(
        apiKey!,
        generationPayload,
        content,
      );

      const response: any = await httpClient.post(apiUrl, {
        headers,
        body: JSON.stringify(requestBody),
      });
      await Bun.sleep(1000);

      console.log("Raw Mistral Response (Master Prompt):", response);

      expect(response.choices[0].message.content).toBeTypeOf("string");
      expect(response.choices[0].message.content.length).toBeGreaterThan(0);

      parseAndValidateFlashcards(response.choices[0].message.content);
    },
    10000,
  );

  itifAgent(
    "should generate flashcards using an agent",
    async () => {
      const generationPayload = { agentId: agentId! };
      const content =
        "The capital of Spain is Madrid. The powerhouse of the cell is the mitochondria.";

      const { apiUrl, requestBody, headers } = buildMistralRequest(
        apiKey!,
        generationPayload,
        content,
      );

      const response: any = await httpClient.post(apiUrl, {
        headers,
        body: JSON.stringify(requestBody),
      });
      await Bun.sleep(1000);

      console.log("Raw Mistral Response (Agent):", response);

      expect(response.choices[0].message.content).toBeTypeOf("string");
      expect(response.choices[0].message.content.length).toBeGreaterThan(0);

      parseAndValidateFlashcards(response.choices[0].message.content);
    },
    10000,
  );
});
