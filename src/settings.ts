import { App, PluginSettingTab, Setting } from "obsidian";
import AiAnkiFlashcardsPlugin from "./main";

export class AiAnkiFlashcardsSettingTab extends PluginSettingTab {
    plugin: AiAnkiFlashcardsPlugin;

    constructor(app: App, plugin: AiAnkiFlashcardsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h2", { text: "AI Anki Flashcards Settings" });

        new Setting(containerEl)
            .setName("LLM Provider")
            .setDesc("Choose your LLM provider")
            .addDropdown(dropdown => dropdown
                .addOption("gemini", "Gemini")
                .addOption("mistral", "Mistral")
                .setValue(this.plugin.settings.llmProvider)
                .onChange(async (value) => {
                    this.plugin.settings.llmProvider = value as any;
                    await this.plugin.saveSettings();
                    this.display();
                }));
        
        if (this.plugin.settings.llmProvider === "gemini") {
            new Setting(containerEl)
                .setName("Gemini API Key")
                .setDesc("Your API key for Gemini")
                .addText(text => text
                    .setPlaceholder("Enter your API key")
                    .setValue(this.plugin.settings.geminiApiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.geminiApiKey = value;
                        await this.plugin.saveSettings();
                    }));
        }

        if (this.plugin.settings.llmProvider === "mistral") {
            new Setting(containerEl)
                .setName("Mistral API Key")
                .setDesc("Your API key for Mistral")
                .addText(text => text
                    .setPlaceholder("Enter your API key")
                    .setValue(this.plugin.settings.mistralApiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.mistralApiKey = value;
                        await this.plugin.saveSettings();
                    }));
        }

        new Setting(containerEl)
            .setName("Anki Connect URL")
            .setDesc("The URL of your Anki Connect server")
            .addText(text => text
                .setPlaceholder("http://localhost:8765")
                .setValue(this.plugin.settings.ankiConnectUrl)
                .onChange(async (value) => {
                    this.plugin.settings.ankiConnectUrl = value;
                    await this.plugin.saveSettings();
                }));
        
        containerEl.createEl("h3", { text: "Master Prompts" });

        this.plugin.settings.masterPrompts.forEach((prompt, index) => {
            const setting = new Setting(containerEl)
                .setName(`Prompt #${index + 1}`)
                .addText(text => text
                    .setPlaceholder("Prompt name")
                    .setValue(prompt.name)
                    .onChange(async (value) => {
                        prompt.name = value;
                        await this.plugin.saveSettings();
                    }))
                .addTextArea(text => text
                    .setPlaceholder("Prompt text")
                    .setValue(prompt.text)
                    .onChange(async (value) => {
                        prompt.text = value;
                        await this.plugin.saveSettings();
                    }))
                .addButton(button => button
                    .setButtonText("Delete")
                    .onClick(async () => {
                        this.plugin.settings.masterPrompts.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    }));
        });

        new Setting(containerEl)
            .addButton(button => button
                .setButtonText("New prompt")
                .onClick(async () => {
                    this.plugin.settings.masterPrompts.push({ name: "", text: "" });
                    await this.plugin.saveSettings();
                    this.display();
                }));
    }
}
