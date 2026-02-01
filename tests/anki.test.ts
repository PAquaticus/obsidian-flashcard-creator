import { describe, it, expect, vi, beforeEach } from "vitest";
import * as anki from "../src/services/anki";
import { request } from "../src/services/httpClient";
import { config } from "dotenv";

config();

vi.mock("../src/services/httpClient");

describe("Anki Service", () => {
  const ANKI_CONNECT_URL = process.env.ANKI_CONNECT_URL;

  beforeEach(() => {
    // Reset the mock before each test
    (request as ReturnType<typeof vi.fn>).mockReset();
  });

  describe("getDecks", () => {
    it("should return deck names on success", async () => {
      (request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        JSON.stringify({ decks: ["Default", "Deck 2"] }),
      );

      const decks = await anki.getDecks(ANKI_CONNECT_URL);
      expect(decks).toEqual(["Default", "Deck 2"]);
      expect(request).toHaveBeenCalledWith({
        url: `${ANKI_CONNECT_URL}/decks`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });

  describe("addNote", () => {
    it("should successfully add a note", async () => {
      (request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        JSON.stringify({ status: "success" }),
      );

      const note = {
        front: "Front of the card",
        back: "Back of the card",
        deck: "My Deck",
        tags: ["tag1", "tag2"],
      };

      const result = await anki.addNote(ANKI_CONNECT_URL, note);
      expect(result).toEqual({ status: "success" });
      expect(request).toHaveBeenCalledWith({
        url: `${ANKI_CONNECT_URL}/add-card`,
        method: "POST",
        body: JSON.stringify(note),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });
});
