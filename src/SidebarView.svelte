<script lang="ts">
  import { flashcards, isLoading, error, settings as settingsStore } from "./stores";
  import * as anki from "./services/anki";
  import { gemini } from "./services/gemini";
  import { mistral } from "./services/mistral";
  import { onMount } from "svelte";
  import { Notice, type App } from "obsidian";
  import type { AiAnkiFlashcardsSettings, LLMProvider } from "./types";
  import { ObsidianHttpClient } from "./services/httpClient";
  import type { LLM } from "./services/llm";

  export let app: App;
  export let settings: AiAnkiFlashcardsSettings;

  const httpClient = new ObsidianHttpClient();

  onMount(() => {
    settingsStore.set(settings);
  });

  let selectedPromptText = "";
  let selectedPromptName = "";

  $: {
    if ($settingsStore.masterPrompts.length > 0 && !selectedPromptName) {
      selectedPromptName = $settingsStore.masterPrompts[0].name;
    }
  }

  $: {
    const prompt = $settingsStore.masterPrompts.find(p => p.name === selectedPromptName);
    if (prompt) {
      selectedPromptText = prompt.text;
    }
  }

  async function generate() {
    $isLoading = true;
    $error = null;
    $flashcards = [];

    try {
      // 1. Check anki connect
      new Notice("Checking Anki Connect...");
      await anki.checkVersion($settingsStore.ankiConnectUrl);

      // 2. Get content
      const editor = app.workspace.activeEditor;
      if (!editor) {
        throw new Error("No active editor found.");
      }
      const content = editor.editor.getSelection() || editor.editor.getValue();
      if (!content) {
        throw new Error("No content selected or available in the current file.");
      }

      // 3. Generate flashcards
      new Notice("Generating flashcards with AI...");
      
      let llm: LLM;
      let apiKey: string | undefined;

      switch ($settingsStore.llmProvider) {
        case "gemini":
          llm = gemini;
          apiKey = $settingsStore.geminiApiKey;
          break;
        case "mistral":
          llm = mistral;
          apiKey = $settingsStore.mistralApiKey;
          break;
        default:
          throw new Error("Unknown LLM provider.");
      }

      if (!apiKey) {
        throw new Error("API key for the selected LLM provider is not set.");
      }
      
      const rawFlashcards = await llm.generateFlashcards(httpClient, apiKey, selectedPromptText, content);

      // 4. Parse and display
      const parsed = JSON.parse(rawFlashcards);
      $flashcards = parsed.map((card: any, index: number) => ({
        id: `card-${index}`,
        question: card.question || "",
        answer: card.answer || "",
        selected: true,
      }));

      new Notice(`Generated ${$flashcards.length} flashcards.`);

    } catch (e: any) {
      $error = e.message;
      new Notice(`Error: ${e.message}`);
    } finally {
      $isLoading = false;
    }
  }

  async function send() {
    $isLoading = true;
    $error = null;

    const cardsToSend = $flashcards.filter(c => c.selected);

    try {
      new Notice(`Sending ${cardsToSend.length} cards to Anki...`);
      for (const card of cardsToSend) {
        await anki.addNote($settingsStore.ankiConnectUrl, "Default", "Basic", { Front: card.question, Back: card.answer });
      }
      new Notice("Successfully sent cards to Anki!");
      $flashcards = $flashcards.filter(c => !c.selected);
    } catch (e: any) {
      $error = e.message;
      new Notice(`Error: ${e.message}`);
    }
  } finally {
      $isLoading = false;
    }
  }

</script>


<div class="container">
  <h1>AI Anki Flashcards</h1>

  {#if $settingsStore.masterPrompts.length > 0}
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

    <button on:click={generate} disabled={$isLoading}>
      {#if $isLoading}Generating...{:else}Generate Flashcards{/if}
    </button>
  {:else}
    <p>Please configure your master prompts in the plugin settings.</p>
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
          <input type="text" bind:value={card.question} />
          <input type="text" bind:value={card.answer} />
        </div>
      </div>
    {/each}
  </div>

  {#if $flashcards.length > 0}
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
