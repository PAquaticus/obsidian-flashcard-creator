<script lang="ts">
    import { onMount } from "svelte";
    import {
        flashcards,
        isLoading,
        error,
        settings as settingsStore,
        decks,
        ankiConnectUrl,
    } from "./stores";
    import * as anki from "./services/anki";
    import { gemini } from "./services/gemini";
    import { mistral } from "./services/mistral";
    import { Notice, type App, MarkdownView } from "obsidian";
    import type { LLMProvider, Deck, Note, GenerationPayload } from "./types";
    import { ObsidianHttpClient } from "./services/httpClient";
    import type { LLM } from "./services/llm";

    export let app: App;

    const httpClient = new ObsidianHttpClient();

    // Component state variables
    let selectedLlm: LLMProvider = $settingsStore.llmProvider;
    let availableLlms: LLMProvider[] = [];

    let selectedPrompt: "prompt" | "agent" = "prompt";
    let selectedPromptName = "";
    let selectedPromptText = "";
    let selectedAgentName = "";
    let selectedAgentId = "";

    let availableDecks: Deck[] = [];
    let selectedDeckName: string = "";
    let newDeckName: string = "";
    let showNewDeckInput: boolean = false;

    // Lifecycle hook for initial deck loading
    onMount(() => {
        refreshDecks();
    });

    // Reactive block for LLM provider selection logic
    $: {
        const available: LLMProvider[] = [];
        if ($settingsStore.apiKeys.gemini) {
            available.push("gemini");
        }
        if ($settingsStore.apiKeys.mistral) {
            available.push("mistral");
        }
        availableLlms = available;
        if (available.length > 0 && !available.includes(selectedLlm)) {
            selectedLlm = available[0];
        }

        if ($settingsStore.masterPrompts.length > 0 && !selectedPromptName) {
            selectedPromptName = $settingsStore.masterPrompts[0].name;
        }

        if (
            selectedLlm === "mistral" &&
            $settingsStore.mistralAgents.length > 0 &&
            !selectedAgentName
        ) {
            selectedAgentName = $settingsStore.mistralAgents[0].name;
        }

        const prompt = $settingsStore.masterPrompts.find(
            (p) => p.name === selectedPromptName,
        );
        if (prompt) {
            selectedPromptText = prompt.text;
        }

        const agent = $settingsStore.mistralAgents.find(
            (a) => a.name === selectedAgentName,
        );
        if (agent) {
            selectedAgentId = agent.id;
        }
    }

    // Reactive block for deck availability
    $: {
        availableDecks = $decks;
        if (availableDecks.length > 0 && !selectedDeckName) {
            selectedDeckName = availableDecks[0].name; // Default to the first deck
        }
    }

    async function generate() {
        $isLoading = true;
        $error = null;
        $flashcards = [];

        try {
            // 1. Get content from an open Markdown editor
            let content = "";
            let editorFound = false;

            // Iterate through all leaves to find a Markdown view
            app.workspace.iterateAllLeaves((leaf) => {
                if (leaf.view instanceof MarkdownView) {
                    const editor = leaf.view.editor;
                    content = editor.getSelection(); // Try to get selection first
                    if (!content) {
                        content = editor.getValue(); // If no selection, get full content
                    }
                    if (content) {
                        // If we found content, we're done
                        editorFound = true;
                        return false; // Stop iterating
                    }
                }
                return true; // Continue iterating
            });

            if (!editorFound) {
                throw new Error(
                    "No content found in any open Markdown editor. Please open a Markdown file and ensure it has content.",
                );
            }

            // 2. Generate flashcards
            new Notice("Generating flashcards with AI...");

            let llm: LLM;
            let apiKey: string | undefined;
            let generationPayload: GenerationPayload;

            switch (selectedLlm) {
                case "gemini":
                    llm = gemini;
                    apiKey = $settingsStore.apiKeys.gemini;
                    generationPayload = selectedPromptText;
                    break;
                case "mistral":
                    llm = mistral;
                    apiKey = $settingsStore.apiKeys.mistral;
                    if (selectedPrompt === "agent") {
                        generationPayload = { agentId: selectedAgentId };
                    } else {
                        generationPayload = selectedPromptText;
                    }
                    break;
                default:
                    throw new Error("Unknown LLM provider.");
            }

            if (!apiKey) {
                throw new Error(
                    "API key for the selected LLM provider is not set.",
                );
            }

            const rawFlashcards = await llm.generateFlashcards(
                httpClient,
                apiKey,
                generationPayload,
                content,
            );

            // 3. Parse and display
            const parsed = JSON.parse(rawFlashcards);
            $flashcards = parsed.flashcards.map((card: any, index: number) => ({
                // biome-ignore lint/suspicious/noExplicitAny: Card structure from LLM is dynamic
                id: `card-${index}`,
                question: card.q || "",
                answer: card.a || "",
                selected: true,
            }));

            new Notice(`Generated ${$flashcards.length} flashcards.`);
        } catch (e: any) {
            // biome-ignore lint/suspicious/noExplicitAny: Error handling can be generic
            $error = e.message;
            new Notice(`Error: ${e.message}`);
        } finally {
            $isLoading = false;
        }
    }

    async function send() {
        if (!$ankiConnectUrl) {
            new Notice(
                "Anki Connect URL is not configured. Please set it in the plugin settings.",
            );
            return;
        }

        $isLoading = true;
        $error = null;

        const cardsToSend = $flashcards.filter((c) => c.selected);

        if (cardsToSend.length === 0) {
            new Notice("No cards selected to send.");
            $isLoading = false;
            return;
        }

        let deckToUse = selectedDeckName;
        if (showNewDeckInput) {
            if (!newDeckName.trim()) {
                new Notice("Please enter a name for the new deck.");
                $isLoading = false;
                return;
            }
            deckToUse = newDeckName.trim();
        }

        try {
            new Notice(
                `Sending ${cardsToSend.length} cards to Anki to deck "${deckToUse}"...`,
            );
            for (const card of cardsToSend) {
                const note: Note = {
                    front: card.question,
                    back: card.answer,
                    deck: deckToUse,
                    tags: [],
                };
                await anki.addNote($ankiConnectUrl, note); // Use $ankiConnectUrl from store
            }
            new Notice("Successfully sent cards to Anki!");
            $flashcards = $flashcards.filter((c) => !c.selected);
        } catch (e: any) {
            // biome-ignore lint/suspicious/noExplicitAny: Error handling can be generic
            $error = e.message;
            new Notice(`Error: ${e.message}`);
        } finally {
            $isLoading = false;
        }
    }

    // Function to refresh decks
    async function refreshDecks() {
        if (!$ankiConnectUrl) {
            new Notice(
                "Anki Connect URL is not configured. Please set it in the plugin settings.",
            );
            return;
        }
        try {
            const loadedDecks = await anki.getDecks($ankiConnectUrl);
            decks.set(loadedDecks);
            new Notice("Anki decks refreshed!");
        } catch (e: any) {
            // biome-ignore lint/suspicious/noExplicitAny: Error handling can be generic
            new Notice(
                `Failed to refresh Anki decks. Is Anki running and accessible at ${$ankiConnectUrl}? Check console for details.`,
            );
            $error = e.message; // Also set component error state
        }
    }
</script>

<div class="container">
    <h1>AI Anki Flashcards</h1>

    {#if availableLlms.length > 0}
        <div class="form-group">
            <label for="llm-select">LLM Provider:</label>
            <select
                id="llm-select"
                bind:value={selectedLlm}
                on:change={() => (selectedPrompt = "prompt")}
            >
                {#each availableLlms as llm}
                    <option value={llm}>{llm}</option>
                {/each}
            </select>
        </div>

        {#if selectedLlm === "mistral"}
            <div class="form-group">
                <label for="prompt-type-select">Use:</label>
                <select id="prompt-type-select" bind:value={selectedPrompt}>
                    <option value="prompt">Master Prompt</option>
                    <option value="agent">Agent</option>
                </select>
            </div>
        {/if}

        {#if selectedPrompt === "prompt"}
            <div class="form-group">
                <label for="prompt-select">Master Prompt:</label>
                <select id="prompt-select" bind:value={selectedPromptName}>
                    {#each $settingsStore.masterPrompts as prompt}
                        <option value={prompt.name}>{prompt.name}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <textarea rows="5" bind:value={selectedPromptText}></textarea>
            </div>
        {:else if selectedLlm === "mistral" && selectedPrompt === "agent"}
            <div class="form-group">
                <label for="agent-select">Agent:</label>
                <select id="agent-select" bind:value={selectedAgentName}>
                    {#each $settingsStore.mistralAgents as agent}
                        <option value={agent.name}>{agent.name}</option>
                    {/each}
                </select>
            </div>
        {/if}

        <button on:click={generate} disabled={$isLoading}>
            {#if $isLoading}Generating...{:else}Generate Flashcards{/if}
        </button>
    {:else}
        <p>
            Please configure an API key for at least one LLM provider in the
            plugin settings.
        </p>
    {/if}

    <hr />

    {#if $error}
        <div class="error-box">{$error}</div>
    {/if}

    <h2>Review Flashcards</h2>
    <div class="flashcard-list">
        {#each $flashcards as card (card.id)}
            <div class="flashcard">
                <input type="checkbox" bind:checked={card.selected} />
                <div class="card-content">
                    <textarea bind:value={card.question} />
                    <textarea
                        rows={Math.max(1, card.answer.length / 50)}
                        bind:value={card.answer}
                    />
                </div>
            </div>
        {/each}
    </div>

    {#if $flashcards.length > 0}
        <div class="form-group">
            <label for="deck-select">Select Anki Deck:</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <select
                    id="deck-select"
                    bind:value={selectedDeckName}
                    on:change={() =>
                        (showNewDeckInput =
                            selectedDeckName === "CREATE_NEW_DECK")}
                >
                    {#each availableDecks as deck}
                        <option value={deck.name}>{deck.name}</option>
                    {/each}
                    <option value="CREATE_NEW_DECK">Create new deck...</option>
                </select>
                <button on:click={refreshDecks} class="mod-cta">Refresh</button>
            </div>
            {#if showNewDeckInput}
                <input
                    type="text"
                    bind:value={newDeckName}
                    placeholder="Enter new deck name"
                />
            {/if}
        </div>
        <button on:click={send} disabled={$isLoading}>
            {#if $isLoading}Sending...{:else}Send to Anki{/if}
        </button>
    {/if}
</div>

<style>
    .container {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .flashcard-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .flashcard {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .card-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex-grow: 1;
    }
    input[type="text"] {
        width: 100%;
    }
    .error-box {
        padding: 1rem;
        background-color: var(--background-secondary-alt);
        border: 1px solid var(--background-modifier-border);
        color: var(--text-error);
    }
</style>
