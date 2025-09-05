import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import SchemaFormPlugin from "./main";

export interface SchemaFormSettings {
	schemaFolderPath: string;
	debugMode: boolean;
}

export const DEFAULT_SETTINGS: SchemaFormSettings = {
	schemaFolderPath: "",
	debugMode: false,
};

export class SchemaFormSettingTab extends PluginSettingTab {
	plugin: SchemaFormPlugin;

	constructor(app: App, plugin: SchemaFormPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Schema Form Settings" });

		// Debug Mode Toggle
		new Setting(containerEl)
			.setName("Debug Mode")
			.setDesc("Enable debug mode for troubleshooting")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(async (value) => {
						this.plugin.settings.debugMode = value;
						await this.plugin.saveSettings();

						// Update debug API availability
						if (value) {
							this.enableDebugAPI();
						} else {
							this.disableDebugAPI();
						}
					}),
			);

		// Schema Folder Path with Folder Picker
		new Setting(containerEl)
			.setName("Schema Folder Path")
			.setDesc("Select the folder containing your schema files")
			.addText((text) => {
				text.setPlaceholder("Select a folder...")
					.setValue(this.plugin.settings.schemaFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.schemaFolderPath = value;
						await this.plugin.saveSettings();
					});

				// Make the text input readonly to force folder picker usage
				text.inputEl.readOnly = true;
				text.inputEl.classList.add("schema-folder-input"); // Use CSS class instead of inline style

				return text;
			})
			.addButton((button) =>
				button
					.setButtonText("Browse")
					.setTooltip("Select folder")
					.onClick(() => {
						this.openFolderPicker();
					}),
			);

		// Additional settings section
		containerEl.createEl("h3", { text: "Advanced Settings" });

		// Show current schema folder info
		if (this.plugin.settings.schemaFolderPath) {
			const folderInfo = containerEl.createEl("div", {
				cls: "setting-item-info",
			});
			folderInfo.createEl("div", {
				text: `Current folder: ${this.plugin.settings.schemaFolderPath}`,
				cls: "setting-item-description",
			});

			// Validate folder exists
			const folder = this.app.vault.getAbstractFileByPath(
				this.plugin.settings.schemaFolderPath,
			);
			if (folder && folder instanceof TFolder) {
				folderInfo.createEl("div", {
					text: "✓ Folder exists",
					cls: "setting-item-description folder-status-success", // Use CSS class
				});
			} else {
				folderInfo.createEl("div", {
					text: "⚠ Folder not found",
					cls: "setting-item-description folder-status-error", // Use CSS class
				});
			}
		}
	}

	private async openFolderPicker(): Promise<void> {
		// Create a modal for folder selection
		const folders = this.getAllFolders();

		// Use Obsidian's built-in suggest modal
		const { SuggestModal } = require("obsidian");

		class FolderSuggestModal extends SuggestModal<TFolder> {
			private onChoose: (folder: TFolder) => void;

			constructor(app: App, onChoose: (folder: TFolder) => void) {
				super(app);
				this.onChoose = onChoose;
				this.setPlaceholder("Type to search for folders...");
			}

			getSuggestions(query: string): TFolder[] {
				return folders.filter((folder) =>
					folder.path.toLowerCase().includes(query.toLowerCase()),
				);
			}

			renderSuggestion(folder: TFolder, el: HTMLElement) {
				el.createEl("div", { text: folder.path });
			}

			onChooseSuggestion(
				folder: TFolder,
				evt: MouseEvent | KeyboardEvent,
			) {
				this.onChoose(folder);
			}
		}

		new FolderSuggestModal(this.app, async (folder: TFolder) => {
			this.plugin.settings.schemaFolderPath = folder.path;
			await this.plugin.saveSettings();
			this.display(); // Refresh the settings display
		}).open();
	}

	private getAllFolders(): TFolder[] {
		const folders: TFolder[] = [];

		const addFolder = (folder: TFolder) => {
			folders.push(folder);
			for (const child of folder.children) {
				if (child instanceof TFolder) {
					addFolder(child);
				}
			}
		};

		// Add root folder
		const rootFolder = this.app.vault.getRoot();
		folders.push(rootFolder);

		// Add all subfolders
		for (const child of rootFolder.children) {
			if (child instanceof TFolder) {
				addFolder(child);
			}
		}

		return folders.sort((a, b) => a.path.localeCompare(b.path));
	}

	private enableDebugAPI(): void {
		// Expose debug API to global window object
		if (!window.SchemaFormDebug) {
			window.SchemaFormDebug = {
				isPluginLoaded: () => {
					return !!this.plugin && this.plugin.app !== undefined;
				},
				getTemplaterObject: () => {
					return window.Templater;
				},
				testAPI: () => {
					return window.Templater?.SchemaForm;
				},
			};
		}

		console.log("Schema Form Debug API enabled");
	}

	private disableDebugAPI(): void {
		// Remove debug API from global window object
		if (window.SchemaFormDebug) {
			delete window.SchemaFormDebug;
		}

		console.log("Schema Form Debug API disabled");
	}
}
