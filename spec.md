# AI Anki Flashcards Plugin Specification

This document outlines the technical specification for the AI Anki Flashcards Obsidian plugin.

## 1. Plugin Interface (Sidebar View)

The main user interface will be a view in the left sidebar of Obsidian. This view will be built using Svelte.

### Components:

- **Prompt Selection:**
    - A dropdown/select menu to choose from a list of pre-configured "master prompts".
    - A text area, pre-filled with the selected master prompt, allowing for on-the-fly modifications before generation.

- **Generation Button:**
    - A button labeled "Generate Flashcards".
    - When clicked, it will trigger the flashcard generation process based on the currently active file or selection.

- **Flashcard Review Area:**
    - This area will be populated after the AI returns with flashcard data.
    - It will display a list of generated flashcards.
    - Each flashcard item will have:
        - A checkbox to select it for sending to Anki.
        - Two editable text fields: one for the "Question" and one for the "Answer".
        - This allows the user to review and modify the content before submission.

- **Anki Submission Button:**
    - A button labeled "Send to Anki".
    - This will be active only when there are selected flashcards.
    - When clicked, it sends the selected and edited flashcards to the Anki Connect server.

- **Status Display:**
    - A small area to display feedback to the user, such as:
        - "Checking Anki Connect..."
        - "Generating flashcards..."
        - "Successfully sent X flashcards to Anki."
        - "Error: Anki Connect is not reachable."
        - "Error: Gemini API key is not valid."

## 2. Plugin Configuration (Settings Page)

The plugin will have a settings page within Obsidian's settings.

### Settings Fields:

- **Gemini API Key:**
    - A text input field for the user's Gemini API key. This should be stored securely.

- **Anki Connect Configuration:**
    - **URL:** Text input for the Anki Connect server URL (e.g., `http://localhost:8765`).
    - **Username:** Text input for the Anki Connect username (if required).
    - **Password:** A password input field for the Anki Connect password (if required).

- **Master Prompts:**
    - A section to manage master prompts for the AI.
    - The user should be able to:
        - Add a new master prompt (e.g., via a text area and "Save" button).
        - Edit an existing master prompt.
        - Delete a master prompt.
        - Each prompt should have a name for easy identification in the sidebar dropdown.

## 3. Core Logic and Workflow

### Workflow:

1.  **User Action:** The user opens a note, selects some text (optional), and opens the plugin sidebar.
2.  **Prompt Selection:** The user chooses a master prompt from the dropdown and can modify it in the text area.
3.  **Generation Trigger:** The user clicks "Generate Flashcards".
4.  **Anki Connect Check (Pre-flight):**
    - The plugin will make a test call to the Anki Connect URL (e.g., a simple `version` request) to verify connectivity.
    - If the check fails, the process stops, and an error is shown to the user.
5.  **Content Gathering:**
    - The plugin determines the context: either the entire content of the active editor or the currently selected text.
6.  **AI Request:**
    - The plugin constructs a request to the Gemini API.
    - The request will contain the user's content (note/selection) and the system prompt.
    - The prompt will instruct the AI to return a list of flashcards in a structured format (e.g., a JSON array of objects, where each object has a "question" and "answer" key).
    - Example expected AI output:
      ```json
      [
        {"question": "What is the capital of France?", "answer": "Paris"},
        {"question": "What is 2 + 2?", "answer": "4"}
      ]
      ```
7.  **Display for Review:**
    - The plugin parses the AI's response.
    - The list of flashcards is rendered in the sidebar's review area.
8.  **User Review and Selection:**
    - The user can edit the question and answer for each card.
    - The user selects the cards they wish to create in Anki using the checkboxes.
9.  **Anki Submission:**
    - The user clicks "Send to Anki".
    - The plugin constructs a request to the Anki Connect API (`addNotes` action).
    - Each selected flashcard will be formatted as a note object and sent to Anki.
    - The plugin will show a success or error message.

## 4. Data Structures

- **Flashcard:**
  ```typescript
  interface Flashcard {
    id: string; // for UI keying
    question: string;
    answer: string;
    selected: boolean;
  }
  ```

- **Plugin Settings:**
  ```typescript
  interface MyPluginSettings {
    geminiApiKey: string;
    ankiConnectUrl: string;
    ankiConnectUsername?: string;
    ankiConnectPassword?: string;
s    masterPrompts: { name: string; text: string; }[];
  }
  ```

## 5. Implementation Plan

1.  **Setup Sidebar View:** Create the basic Svelte component for the sidebar and register it in `main.ts`.
2.  **Implement Settings Tab:** Create the settings tab with fields for API keys, Anki config, and prompt management.
3.  **Anki Connect Service:** Implement a service/module to handle all communication with Anki Connect, including the pre-flight check and adding notes.
4.  **Gemini Service:** Implement a service/module for making requests to the Gemini API.
5.  **Wire up UI:** Connect the UI components (buttons, dropdowns, etc.) to the core logic.
6.  **State Management:** Use a Svelte store to manage the state of the flashcards, UI, and settings.
7.  **Finalize Workflow:** Integrate all pieces to create the complete user workflow.
8.  **Error Handling:** Implement robust error handling for API calls, network issues, and unexpected data formats.
