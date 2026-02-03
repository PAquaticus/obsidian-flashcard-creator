# Specification

This document outlines the implementation of multi-LLM support in the AI Anki Flashcards plugin.

## 1. High-Level Requirements

The user wants to be able to use multiple Large Language Models (LLMs) for generating flashcards. This includes:
-   Configuring API keys for different LLMs.
-   Choosing the LLM provider in the flashcard generation view.
-   For Mistral, using predefined agents.
-   Defining and using multiple master system prompts.
-   The UI should only show options for LLMs that have a configured API key.

## 2. Detailed Feature Breakdown

### 2.1. Settings

The settings view will be updated to support the new features.

#### 2.1.1. LLM Provider Settings

-   A new section for each supported LLM (Gemini and Mistral).
-   Each section will have a field for the API key.

#### 2.1.2. Master Prompts

-   A new section to manage master system prompts.
-   Users can add, edit, and delete multiple master prompts.
-   Each prompt will be a text area.

#### 2.1.3. Mistral Agents

-   Under the Mistral settings section, users can manage predefined agents.
-   Users can add, edit, and delete agents.
-   Each agent will have a "Name" (for display in the UI) and an "Agent ID".

### 2.2. Sidebar View (Flashcard Generation)

The sidebar view for generating flashcards will be updated to allow the user to select the LLM and prompt/agent.

#### 2.2.1. LLM Selection

-   A dropdown menu to select the LLM provider.
-   This dropdown will only list LLMs for which an API key has been provided in the settings.

#### 2.2.2. Prompt/Agent Selection

-   A second dropdown menu will appear after selecting an LLM.
-   If **Gemini** is selected, this dropdown will list the available "Master Prompts".
-   If **Mistral** is selected, this dropdown will be grouped into "Master Prompts" and "Agents", listing the respective items from the settings.

#### 2.2.3. Flashcard Generation

-   The "Generate Flashcards" button will trigger the card generation using the selected LLM and prompt/agent.
-   The request to the LLM will be formatted to expect the specified JSON output.

## 3. Data Model Changes

The `PluginSettings` interface in `src/settings.ts` will be updated to store the new configuration.

```typescript
export interface PluginSettings {
  llmProvider: 'gemini' | 'mistral';
  apiKeys: {
    gemini: string;
    mistral: string;
  };
  masterPrompts: string[];
  mistralAgents: { name: string; id: string }[];
  // ... existing settings
}
```

## 4. Implementation Plan

1.  **Update Settings:**
    -   Modify `src/settings.ts` to implement the new settings interface and UI components in the `SettingTab` class.
    -   Update `src/main.ts` to handle setting defaults and loading/saving.

2.  **Research Mistral Agents:**
    -   Investigate the Mistral API documentation to understand how to use predefined agents via their ID.

3.  **Update Sidebar View:**
    -   Modify `SidebarView.svelte` to add the new dropdowns for LLM and prompt/agent selection.
    -   Use Svelte's reactive statements to update the UI based on user selections.
    -   Update `src/stores.ts` if necessary to manage the state of available LLMs and prompts.

4.  **Update LLM Services:**
    -   Refactor `src/services/llm.ts` to include a more generic interface if needed.
    -   Update `src/services/gemini.ts` to use the new API key setting and selected master prompt.
    -   Update `src/services/mistral.ts` to:
        -   Use the new API key setting.
        -   Handle both master prompts and predefined agents.
        -   Incorporate the JSON response format requirement into the prompt.

5.  **Testing:**
    -   Review and update existing tests in the `tests/` directory.
    -   Add new tests for the multi-LLM and Mistral agent functionality.
-  **JSON response format**
   -  The user has provided a JSON schema that the AI is expected to return. The system prompt will be updated to reflect this. The new prompt will be:
   
   ```
   You are an expert in generating flashcards. Your response should be in the following JSON format:
   
   {
     "type": "object",
     "required": [
       "flashcards"
     ],
     "properties": {
       "flashcards": {
         "type": "array",
         "items": {
           "type": "object",
           "required": [
             "q",
             "a"
           ],
           "properties": {
             "a": {
               "type": "string",
               "description": "The answer or explanation for the flashcard"
             },
             "q": {
               "type": "string",
               "description": "The question or prompt for the flashcard"
             },
             "level": {
               "type": "string",
               "description": "Is it foundation, judgment or understanding type"
             }
           },
           "additionalProperties": false
         },
         "description": "A list of flashcards, each containing a question and answer pair"
       }
     },
     "additionalProperties": false
   }
   
   Please generate flashcards based on the provided text.
   ```