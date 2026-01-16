import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as anki from '../src/services/anki';
import { request as obsidianRequest } from 'obsidian'; // Import the original request

// Mock the obsidian module before importing anki service
vi.mock('obsidian', () => {
    return {
        request: vi.fn(),
        Notice: vi.fn(),
    };
});

describe('Anki Service', () => {
    const ANKI_CONNECT_URL = 'http://localhost:8765';

    beforeEach(() => {
        // Reset the mock before each test
        (obsidianRequest as ReturnType<typeof vi.fn>).mockReset();
    });

    describe('checkVersion', () => {
        it('should return the version on success', async () => {
            (obsidianRequest as ReturnType<typeof vi.fn>).mockResolvedValueOnce(JSON.stringify({
                result: 6,
                error: null
            }));

            const version = await anki.checkVersion(ANKI_CONNECT_URL);
            expect(version).toBe(6);
            expect(obsidianRequest).toHaveBeenCalledWith({
                url: ANKI_CONNECT_URL,
                method: 'POST',
                body: JSON.stringify({ action: 'version', version: 6, params: {} }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });

        it('should throw an error if Anki Connect returns an error', async () => {
            (obsidianRequest as ReturnType<typeof vi.fn>).mockResolvedValueOnce(JSON.stringify({
                result: null,
                error: 'Anki Connect error'
            }));

            await expect(anki.checkVersion(ANKI_CONNECT_URL)).rejects.toThrow('Anki Connect error');
        });

        it('should throw an error if the request fails', async () => {
            (obsidianRequest as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

            await expect(anki.checkVersion(ANKI_CONNECT_URL)).rejects.toThrow('Network error');
        });
    });

    describe('addNote', () => {
        const deckName = 'Default';
        const modelName = 'Basic';
        const fields = { Front: 'Question', Back: 'Answer' };
        const tags = ['test'];

        it('should add a note on success', async () => {
            (obsidianRequest as ReturnType<typeof vi.fn>).mockResolvedValueOnce(JSON.stringify({
                result: 12345, // Example note ID
                error: null
            }));

            const noteId = await anki.addNote(ANKI_CONNECT_URL, deckName, modelName, fields, tags);
            expect(noteId).toBe(12345);
            expect(obsidianRequest).toHaveBeenCalledWith({
                url: ANKI_CONNECT_URL,
                method: 'POST',
                body: JSON.stringify({
                    action: 'addNote',
                    version: 6,
                    params: {
                        note: {
                            deckName,
                            modelName,
                            fields,
                            tags
                        }
                    }
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });

        it('should throw an error if Anki Connect returns an error', async () => {
            (obsidianRequest as ReturnType<typeof vi.fn>).mockResolvedValueOnce(JSON.stringify({
                result: null,
                error: 'Failed to add note'
            }));

            await expect(anki.addNote(ANKI_CONNECT_URL, deckName, modelName, fields, tags)).rejects.toThrow('Failed to add note');
        });

        it('should throw an error if the request fails', async () => {
            (obsidianRequest as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

            await expect(anki.addNote(ANKI_CONNECT_URL, deckName, modelName, fields, tags)).rejects.toThrow('Network error');
        });
    });
});
