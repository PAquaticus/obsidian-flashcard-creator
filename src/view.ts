import { ItemView, WorkspaceLeaf } from "obsidian";
import SidebarViewComponent from "./SidebarView.svelte";
import type AiAnkiFlashcardsPlugin from "./main";

export const AI_ANKI_FLASHCARDS_VIEW_TYPE = "ai-anki-flashcards-view";

export class AiAnkiFlashcardsView extends ItemView {
    component?: SidebarViewComponent;
    plugin: AiAnkiFlashcardsPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: AiAnkiFlashcardsPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return AI_ANKI_FLASHCARDS_VIEW_TYPE;
    }

    getDisplayText() {
        return "AI Anki Flashcards";
    }

    async onOpen() {
        this.component = new SidebarViewComponent({
            target: this.contentEl,
            props: {
                app: this.app
            }
        });
    }

    async onClose() {
        if (this.component) {
            this.component.$destroy();
        }
    }
}
