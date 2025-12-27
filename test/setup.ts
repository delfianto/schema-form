import { mock } from "bun:test";

// Simple DOM mock for Bun environment
if (typeof document === "undefined") {
	const createEl = (tag: string) => {
		const el = {
			tagName: tag.toUpperCase(),
			children: [] as any[],
			appendChild: function(el: any) { this.children.push(el); },
			style: {},
			classList: {
				add: () => {},
				remove: () => {},
				toggle: () => {},
			},
			addEventListener: () => {},
			removeEventListener: () => {},
						_textContent: "",
						get textContent() { return this._textContent; },
						set textContent(val: string) { 
							this._textContent = val
								.replace(/&/g, "&amp;")
								.replace(/</g, "&lt;")
								.replace(/>/g, "&gt;")
								.replace(/"/g, "&quot;")
								.replace(/'/g, "&#039;");
						},
						get innerHTML() { return this._textContent; },
			set innerHTML(val: string) { this._textContent = val; },
			createEl: function(tag: string, options?: any) {
				const child = createEl(tag);
				if (options?.text) child.textContent = options.text;
				if (options?.cls) (child as any).className = options.cls;
				this.appendChild(child);
				return child;
			},
			createDiv: function(options?: any) {
				return this.createEl("div", options);
			},
		};
		return el;
	};

	(globalThis as any).document = {
		createElement: createEl,
		getElementById: () => null,
		querySelector: () => null,
		body: createEl("body"),
	};

	(globalThis as any).HTMLElement = class {};
	(globalThis as any).Node = class {};
}

// Type definitions for Obsidian mocks
export interface Stat {
	ctime: number;
	mtime: number;
	size: number;
}

export interface Vault {
	read?(file: any): Promise<string>;
	getAbstractFileByPath?(path: string): any | null;
}

export interface TAbstractFile {
	vault: Vault;
	path: string;
	name: string;
	parent: any | null;
}

export interface TFile extends TAbstractFile {
	stat: Stat;
	basename: string;
	extension: string;
}

export interface TFolder extends TAbstractFile {
	children: any[];
	isRoot(): boolean;
}

export interface App {
	vault: Vault;
}

mock.module("obsidian", () => {
	return {
		TFile: class TFile {},
		TFolder: class TFolder {},

		Modal: class Modal {
			app: any;
			containerEl: HTMLElement;
			contentEl: HTMLElement;
			titleEl: HTMLElement;

			constructor(app: any) {
				this.app = app;
				this.containerEl = document.createElement("div");
				this.contentEl = document.createElement("div");
				this.titleEl = document.createElement("h2");
			}

			open(): void {}
			close(): void {}
			onOpen(): void {}
			onClose(): void {}
		},
		Notice: class Notice {
			constructor(_message: string, _timeout?: number) {}
			setMessage(_message: string): this {
				return this;
			}
			hide(): void {}
		},
		Setting: class Setting {
			settingEl: HTMLElement;
			infoEl: HTMLElement;
			nameEl: HTMLElement;
			descEl: HTMLElement;
			controlEl: HTMLElement;

			constructor(_containerEl: HTMLElement) {
				this.settingEl = (globalThis as any).document.createElement("div");
				this.infoEl = (globalThis as any).document.createElement("div");
				this.nameEl = (globalThis as any).document.createElement("div");
				this.descEl = (globalThis as any).document.createElement("div");
				this.controlEl = (globalThis as any).document.createElement("div");
			}

			setName(_name: string): this {
				return this;
			}
			setDesc(_desc: string): this {
				return this;
			}
			addText(_cb: (text: any) => any): this {
				return this;
			}
			addToggle(_cb: (toggle: any) => any): this {
				return this;
			}
			addButton(_cb: (button: any) => any): this {
				return this;
			}
			addDropdown(_cb: (dropdown: any) => any): this {
				return this;
			}
		},
		Plugin: class Plugin {
			app: any;
			manifest: any;

			loadData(): Promise<any> {
				return Promise.resolve({});
			}
			saveData(_data: any): Promise<void> {
				return Promise.resolve();
			}
			addCommand(_command: any): void {}
			addRibbonIcon(_icon: string, _title: string, _callback: () => void): HTMLElement {
				return (globalThis as any).document.createElement("div");
			}
			addSettingTab(_tab: any): void {}
			registerEvent(_event: any): void {}
			registerDomEvent(_el: HTMLElement, _type: string, _callback: any): void {}
		},
		PluginSettingTab: class PluginSettingTab {
			app: any;
			plugin: any;
			containerEl: HTMLElement;

			constructor(app: any, plugin: any) {
				this.app = app;
				this.plugin = plugin;
				this.containerEl = document.createElement("div");
			}

			display(): void {}
			hide(): void {}
		},
		debounce<T extends (...args: any[]) => any>(fn: T, _delay: number, _immediate?: boolean): T {
			return function(this: any, ...args: Parameters<T>) {
				fn.apply(this, args);
			} as any as T;
		},
		SuggestModal: class SuggestModal {
			app: any;
			containerEl: HTMLElement;
			contentEl: HTMLElement;
			titleEl: HTMLElement;

			constructor(app: any) {
				this.app = app;
				this.containerEl = document.createElement("div");
				this.contentEl = document.createElement("div");
				this.titleEl = document.createElement("h2");
			}

			getSuggestions(_query: string): any[] {
				return [];
			}

			renderSuggestion(_item: any, _el: HTMLElement): void {}

			onChooseSuggestion(_item: any, _evt: MouseEvent | KeyboardEvent): void {}

			setPlaceholder(_placeholder: string): void {}

			open(): void {}
			close(): void {}
		},
	};
});
