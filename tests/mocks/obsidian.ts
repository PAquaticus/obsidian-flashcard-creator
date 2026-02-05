import { vi } from 'vitest';

export const request = vi.fn();

// Mocking classes
export const Notice = vi.fn();

export class Plugin {
	constructor(app: App, manifest: any) {}
	async onload() {}
	onunload() {}
}

export class App {
	workspace = {
		on: vi.fn(),
		getLeaf: vi.fn(),
	};
}

export class MarkdownView {}

export class ItemView {
	getViewType(): string {
		return 'mock-view';
	}
	getDisplayText(): string {
		return 'Mock View';
	}
}

export class WorkspaceLeaf {}

export class PluginSettingTab {
	constructor(app: App, plugin: Plugin) {}
	display() {}
}

export class Setting {
	setName = vi.fn().mockReturnThis();
	setDesc = vi.fn().mockReturnThis();
	addText = vi.fn().mockReturnThis();
	addToggle = vi.fn().mockReturnThis();
	addSlider = vi.fn().mockReturnThis();
}