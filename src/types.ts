export type LLMProvider = "gemini" | "mistral";

export interface AiAnkiFlashcardsSettings {
	llmProvider: LLMProvider;
	geminiApiKey?: string;
	mistralApiKey?: string;
	ankiConnectUrl: string;
	ankiConnectUsername?: string;
	ankiConnectPassword?: string;
	masterPrompts: { name: string; text: string; }[];
}
