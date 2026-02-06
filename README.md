# AI Anki Flashcards for Obsidian

An Obsidian plugin to generate Anki flashcards from your notes using AI.

## Features

- **AI-Powered Flashcard Generation**: Automatically create flashcards from your notes using the power of Large Language Models.
- **Multiple AI Providers**: Choose between Google's Gemini or Mistral AI to generate your flashcards.
- **Flexible Prompting**:
  - Use a "Master Prompt" to guide the AI in flashcard creation.
  - Leverage specialized Mistral "Agents" for more controlled and context-specific generation.
- **Review and Edit**: Before sending your new flashcards to Anki, you can review, edit, or delete them within Obsidian.
- **Anki Integration**:
  - Directly send your generated flashcards to a specified Anki deck.
  - Create new Anki decks on the fly from within Obsidian.
  - Uses a custom anki card api that under the hood calls anki pip package on a nother server

## Technologies Ushttps://tchibo.atlassian.net/wiki/spaces/SOUR/pages/364282066/04+Technical+Solutione

- [Obsidian.md](https://obsidian.md/): The note-taking application where the plugin runs.
- [Svelte](https://svelte.dev/): For building the plugin's user interface.
- [TypeScript](https://www.typescriptlang.org/): For writing robust and type-safe code.
- [Vite](https://vitejs.dev/): As the build tool for the plugin.
- [UnoCSS](https://unocss.dev/): For utility-first CSS styling.

## Project Structure

- `src/main.ts`: The entry point for the plugin, where it's initialized in Obsidian.
- `src/view.ts`: Defines the main view for the plugin.
- `src/SidebarView.svelte`: The main user interface component, built with Svelte.
- `src/services/`: Contains the business logic for interacting with external services.
  - `anki.ts`: Handles communication with the AnkiConnect API.
  - `gemini.ts`: Implements flashcard generation using the Gemini API.
  - `mistral.ts`: Implements flashcard generation using the Mistral API.
- `src/settings.ts`: Manages the settings for the plugin.
- `src/types.ts`: Contains the TypeScript type definitions used throughout the project.
- `src/stores.ts`: Svelte stores for managing the application's state.

## Installation and Configuration

### Installation

1.  Download the latest release from the [releases page](https://github.com/your-username/your-repo/releases).
2.  In Obsidian, go to `Settings` > `Community plugins`.
3.  Turn off "Safe mode".
4.  Click on "Install plugin from file" and select the downloaded `main.js`, `manifest.json`, and `styles.css` files.
5.  Enable the "AI Anki Flashcards" plugin.

### Configuration

After installing the plugin, you need to configure it in the settings:

1.  **AnkiConnect URL**: Set the URL for AnkiConnect, which is usually `http://localhost:8765`.
2.  **API Keys**: Provide your API keys for Gemini and/or Mistral.
3.  **Master Prompts**: You can define one or more "Master Prompts" that will be used to instruct the AI on how to generate the flashcards.
4.  **Mistral Agents**: If you use Mistral, you can configure specialized agents with their own instructions.

## Development

To work on this plugin locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org) (v14 or above)
- [Bun](https://bun.sh/)

### Setup

1.  Clone the repository.
2.  Navigate to the project's directory in your terminal.
3.  Install the dependencies:
    ```bash
    bun install
    ```

### Running in Development Mode

To start the development server with hot-reloading:

```bash
bun dev
```

This will watch for changes and automatically rebuild the plugin. You'll need to have the plugin installed in your Obsidian vault and enabled.

### Building for Production

To create a production-ready build of the plugin:

```bash
bun run build
```

The bundled files will be generated in the `dist/` directory.

### Running Tests

To run the test suite:

```bash
bun test
```

### Linting and Formatting

To lint and format the code, use the following commands:

```bash
# To check for linting issues
bun run lint

# To format the code
bun run format
```
