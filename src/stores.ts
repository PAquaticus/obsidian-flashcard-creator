import { writable } from 'svelte/store';
import type { Deck, AiAnkiFlashcardsSettings } from './types';
import { DEFAULT_SETTINGS } from './defaults';

export const decks = writable<Deck[]>([]);
export const ankiConnectUrl = writable<string | undefined>(undefined);

// Stores for UI state
export const flashcards = writable<any[]>([]); // Using any for now, could be more specific
export const isLoading = writable(false);
export const error = writable<string | null>(null);

// Settings store
export const settings = writable<AiAnkiFlashcardsSettings>(DEFAULT_SETTINGS);