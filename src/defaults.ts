import type { AiAnkiFlashcardsSettings } from './types';

export const DEFAULT_SETTINGS: AiAnkiFlashcardsSettings = {
	llmProvider: "gemini",
	apiKeys: {
		gemini: "",
		mistral: "",
	},
	ankiConnectUrl: "http://localhost:8765",
	masterPrompts: [],
	mistralAgents: [],
};
