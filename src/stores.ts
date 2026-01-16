import { writable } from "svelte/store";
import type { AiAnkiFlashcardsSettings } from "./types";

export const settings = writable<AiAnkiFlashcardsSettings>({
    geminiApiKey: "",
    ankiConnectUrl: "http://localhost:8765",
    masterPrompts: [],
});

export interface Flashcard {
    id: string; 
    question: string;
    answer: string;
    selected: boolean;
}

export const flashcards = writable<Flashcard[]>([]);

export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
