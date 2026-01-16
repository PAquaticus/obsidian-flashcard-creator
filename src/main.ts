import { Plugin } from "obsidian";
import { AiAnkiFlashcardsView, AI_ANKI_FLASHCARDS_VIEW_TYPE } from "./view";
import { AiAnkiFlashcardsSettingTab } from "./settings";
import "virtual:uno.css";
import type { AiAnkiFlashcardsSettings } from "./types";

const DEFAULT_SETTINGS: AiAnkiFlashcardsSettings = {
	llmProvider: "gemini",
	geminiApiKey: "",
	mistralApiKey: "",
	ankiConnectUrl: "http://localhost:8765",
	masterPrompts: [],
};

export default class AiAnkiFlashcardsPlugin extends Plugin {
	settings!: AiAnkiFlashcardsSettings;

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new AiAnkiFlashcardsSettingTab(this.app, this));

		this.registerView(AI_ANKI_FLASHCARDS_VIEW_TYPE, (leaf) => new AiAnkiFlashcardsView(leaf, this));

		this.addRibbonIcon("brain-circuit", "AI Anki Flashcards", () => {
			this.activateView();
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(AI_ANKI_FLASHCARDS_VIEW_TYPE);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(AI_ANKI_FLASHCARDS_VIEW_TYPE);

		await this.app.workspace.getLeftLeaf(false).setViewState({
			type: AI_ANKI_FLASHCARDS_VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(AI_ANKI_FLASHCARDS_VIEW_TYPE)[0],
		);
	}
}

