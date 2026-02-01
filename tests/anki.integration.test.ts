import { describe, it, expect } from "vitest";
import * as anki from "../src/services/anki";
import { config } from "dotenv";

config();

describe("Anki Service Integration (requires Anki instance running)", () => {
  const ANKI_CONNECT_URL = process.env.ANKI_CONNECT_URL;

  it('should successfully get decks from a live Anki instance', { timeout: 10000 }, async () => {
    if (!ANKI_CONNECT_URL) {
      it.skip("ANKI_CONNECT_URL is not defined in .env, skipping integration test", () => {});
      return;
    }

    try {
      const decks = await anki.getDecks(ANKI_CONNECT_URL);
      expect(decks).toBeDefined();
      expect(Array.isArray(decks)).toBe(true);
      console.log("Successfully retrieved Anki decks:", decks);
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch')) {
        console.warn('Anki instance is likely not running or accessible at', ANKI_CONNECT_URL);
        it.skip("Anki instance not running or accessible, skipping integration test", () => {});
      } else {
        throw error;
      }
    }
  });
});
