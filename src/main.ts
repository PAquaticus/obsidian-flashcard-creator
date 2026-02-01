import { Plugin, Notice } from "obsidian";
import { AiAnkiFlashcardsView, AI_ANKI_FLASHCARDS_VIEW_TYPE } from "./view";
import { AiAnkiFlashcardsSettingTab } from "./settings";
import "virtual:uno.css";
import type { AiAnkiFlashcardsSettings } from "./types";
import { DEFAULT_SETTINGS } from "./defaults";
import { decks, ankiConnectUrl, settings as settingsStore } from "./stores"; // Added settings as settingsStore
import { getDecks } from './services/anki';

export default class AiAnkiFlashcardsPlugin extends Plugin {
	settings!: AiAnkiFlashcardsSettings;

	async loadSettings() {
		const loadedData = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, this.migrateSettings(loadedData || {}));
		settingsStore.set(this.settings); // Re-enabled this line
	}

	// biome-ignore lint/suspicious/noExplicitAny: This function handles migration of potentially untyped or old settings data.
	migrateSettings(settings: Record<string, any>): AiAnkiFlashcardsSettings { // Changed to Record<string, any>
		if (!settings.apiKeys || typeof settings.apiKeys !== 'object') {
			settings.apiKeys = {
				gemini: settings.geminiApiKey || "",
				mistral: settings.mistralApiKey || ""
			};
			settings.geminiApiKey = undefined;
			settings.mistralApiKey = undefined;
		} else {
			// Ensure nested properties exist even if apiKeys was an object but missing them
			if (!settings.apiKeys.gemini) settings.apiKeys.gemini = "";
			if (!settings.apiKeys.mistral) settings.apiKeys.mistral = "";
		}
		
		if (!settings.mistralAgents || !Array.isArray(settings.mistralAgents)) {
			settings.mistralAgents = [];
		}

		if (!settings.masterPrompts || !Array.isArray(settings.masterPrompts)) {
			settings.masterPrompts = [];
		} else {
			// Ensure masterPrompts elements are objects with name and text
			settings.masterPrompts = settings.masterPrompts.map((p: string | { name: string; text: string }) => { // Changed type of p
				if (typeof p === 'string') { // Handle old format where prompt was just a string
					return { name: p, text: p };
				}
				return { name: p.name || "", text: p.text || "" };
			});
		}

		return settings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
		settingsStore.set(this.settings); // Re-enabled this line
	}

	async onload() {
		await this.loadSettings();

		ankiConnectUrl.set(this.settings.ankiConnectUrl);

		try {
			const loadedDecks = await getDecks(this.settings.ankiConnectUrl);
			decks.set(loadedDecks);
		} catch (error) {
			console.error("Failed to load Anki decks:", error);
			new Notice(`Failed to load Anki decks. Is Anki running and accessible at ${this.settings.ankiConnectUrl}? Check console for details.`);
		}
		

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

		const leftLeaf = this.app.workspace.getLeftLeaf(false);
		if (!leftLeaf) {
			console.warn("No left leaf found to activate view.");
			return;
		}

		await leftLeaf.setViewState({
			type: AI_ANKI_FLASHCARDS_VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(AI_ANKI_FLASHCARDS_VIEW_TYPE)[0],
		);
	}
}
