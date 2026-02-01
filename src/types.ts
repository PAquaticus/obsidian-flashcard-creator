export interface Deck {
    id: number;
    name: string;
}

export interface Card {
    front: string;
    back: string;
    deck: string;
    tags?: string[];
}

export interface Note {
    front: string;
    back: string;
    deck: string;
    tags?: string[];
}

export type GenerationPayload = string | { agentId: string };

export interface AiAnkiFlashcardsSettings {
    llmProvider: "gemini" | "mistral";
    apiKeys: {
        gemini: string;
        mistral: string;
    };
    ankiConnectUrl: string;
    masterPrompts: Array<{ name: string; text: string }>;
    mistralAgents: Array<{ name: string; id: string }>;
}
