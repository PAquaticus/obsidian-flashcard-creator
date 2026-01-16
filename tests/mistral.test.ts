import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { mistral } from '../src/services/mistral';
import { AxiosHttpClient } from './AxiosHttpClient';

describe('Mistral Service', () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    const httpClient = new AxiosHttpClient();

    // Skip tests if API key is not provided
    const itif = apiKey ? it : it.skip;

    itif('should generate flashcards from a given text', async () => {
        const systemPrompt = "Generate 2 flashcards in JSON format with 'question' and 'answer' keys from the following text:";
        const content = "The capital of France is Paris. The mitochondria is the powerhouse of the cell.";

        const response = await mistral.generateFlashcards(httpClient, apiKey!, systemPrompt, content);

        console.log("Raw Mistral Response:", response); // Log the raw response

        expect(response).toBeTypeOf('string');
        expect(response.length).toBeGreaterThan(0);

        let flashcards;
        try {
            flashcards = JSON.parse(response);
        } catch (e) {
            console.error("Failed to parse JSON:", e); // Log parsing error
            // Fail the test if parsing fails
            expect.fail("Response was not valid JSON.");
        }

        expect(Array.isArray(flashcards)).toBe(true);
        expect(flashcards.length).toBe(2);
        flashcards.forEach(card => {
            expect(card).toHaveProperty('question');
            expect(card).toHaveProperty('answer');
        });
    }, 10000); // 10 second timeout for the API call
});
