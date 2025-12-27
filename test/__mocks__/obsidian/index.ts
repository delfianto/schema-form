export interface Stat {
	ctime: number;
	mtime: number;
	size: number;
}

export interface Vault {
	read?(file: TFile): Promise<string>;
	getAbstractFileByPath?(path: string): TAbstractFile | null;
}

export interface TAbstractFile {
	vault: Vault;
	path: string;
	name: string;
	parent: TFolder | null;
}

export interface TFile extends TAbstractFile {
	stat: Stat;
	basename: string;
	extension: string;
}

export interface TFolder extends TAbstractFile {
	children: (TFile | TFolder)[];
	isRoot(): boolean;
}

export interface App {
	vault: Vault;
}

export class Modal {
	app: App;
	containerEl: HTMLElement;
	contentEl: HTMLElement;
	titleEl: HTMLElement;

	constructor(app: App) {
		this.app = app;
		this.containerEl = document.createElement("div");
		this.contentEl = document.createElement("div");
		this.titleEl = document.createElement("h2");
	}

	open(): void {}
	close(): void {}
	onOpen(): void {}
	onClose(): void {}
}

export class Notice {
	constructor(_message: string, _timeout?: number) {}
	setMessage(_message: string): this {
		return this;
	}
	hide(): void {}
}

export class Setting {
	settingEl: HTMLElement;
	infoEl: HTMLElement;
	nameEl: HTMLElement;
	descEl: HTMLElement;
	controlEl: HTMLElement;

	constructor(_containerEl: HTMLElement) {
		this.settingEl = document.createElement("div");
		this.infoEl = document.createElement("div");
		this.nameEl = document.createElement("div");
		this.descEl = document.createElement("div");
		this.controlEl = document.createElement("div");
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
}

export class Plugin {
	app!: App;
	manifest: any;

	loadData(): Promise<any> {
		return Promise.resolve({});
	}
	saveData(_data: any): Promise<void> {
		return Promise.resolve();
	}
	addCommand(_command: any): void {}
	addRibbonIcon(_icon: string, _title: string, _callback: () => void): HTMLElement {
		return document.createElement("div");
	}
	addSettingTab(_tab: any): void {}
	registerEvent(_event: any): void {}
	registerDomEvent(_el: HTMLElement, _type: string, _callback: any): void {}
}

export class PluginSettingTab {
	app: App;
	plugin: Plugin;
	containerEl: HTMLElement;

	constructor(app: App, plugin: Plugin) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = document.createElement("div");
	}

	display(): void {}
	hide(): void {}
}

export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number,
	immediate?: boolean
): T {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return function(this: any, ...args: Parameters<T>) {
		const later = () => {
			timeoutId = undefined;
			if (!immediate) fn.apply(this, args);
		};

		const callNow = immediate && !timeoutId;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(later, delay);

		if (callNow) fn.apply(this, args);
	} as T;
}

export class SuggestModal<T> extends Modal {
	constructor(app: App) {
		super(app);
	}

	getSuggestions(_query: string): T[] {
		return [];
	}

	renderSuggestion(_item: T, _el: HTMLElement): void {}

	onChooseSuggestion(_item: T, _evt: MouseEvent | KeyboardEvent): void {}

	setPlaceholder(_placeholder: string): void {}
}
