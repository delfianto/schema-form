import {
  App,
  PluginSettingTab,
  Setting,
  SuggestModal,
  TFolder,
} from "obsidian";

import SchemaFormPlugin from "../main";
import { debugModals } from "./debug-ui";

export class SchemaFormSettingTab extends PluginSettingTab {
  plugin: SchemaFormPlugin;

  constructor(plugin: SchemaFormPlugin) {
    super(plugin.app, plugin);
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
          .setValue(this.plugin.settings.debugFlag)
          .onChange(async (value) => {
            this.plugin.settings.debugFlag = value;
            await this.plugin.saveSettings();
          }),
      );

    // Schema Folder Path with Folder Picker
    new Setting(containerEl)
      .setName("Schema Folder Path")
      .setDesc("Select the folder containing your schema files")
      .addText((text) => {
        text
          .setPlaceholder("Select a folder...")
          .setValue(this.plugin.settings.schemaDir)
          .onChange(async (value) => {
            this.plugin.settings.schemaDir = value;
            await this.plugin.saveSettings();
          });

        // Make the text input readonly to force folder picker usage
        text.inputEl.readOnly = true;
        text.inputEl.classList.add("schema-folder-input");

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

    // Show current schema folder info
    if (this.plugin.settings.schemaDir) {
      const folderInfo = containerEl.createEl("div", {
        cls: "setting-item-info",
      });
      folderInfo.createEl("div", {
        text: `Current folder: ${this.plugin.settings.schemaDir}`,
        cls: "setting-item-description",
      });

      // Validate folder exists
      const folder = this.app.vault.getAbstractFileByPath(
        this.plugin.settings.schemaDir,
      );
      if (folder && folder instanceof TFolder) {
        folderInfo.createEl("div", {
          text: "✓ Folder exists",
          cls: "setting-item-description folder-status-success",
        });
      } else {
        folderInfo.createEl("div", {
          text: "⚠ Folder not found",
          cls: "setting-item-description folder-status-error",
        });
      }
    }

    this.addDebugSection(containerEl);
  }

  private addDebugSection(containerEl: HTMLElement): void {
    if (this.plugin.settings.debugFlag) {
      containerEl.createEl("h2", { text: "Debug Tools" });

      new Setting(containerEl)
        .setName("Test Error Modal")
        .setDesc("Test the schema error modal with dummy data")
        .addButton((button) =>
          button
            .setButtonText("Trigger Test Error")
            .setWarning() // Makes the button red/warning style
            .onClick(() => {
              debugModals.basicError(this.app);
            }),
        );

      new Setting(containerEl)
        .setName("Test Parse Error")
        .setDesc("Test with a realistic JSON parsing error")
        .addButton((button) =>
          button.setButtonText("Test JSON Parse Error").onClick(() => {
            debugModals.parseError(this.app);
          }),
        );

      new Setting(containerEl)
        .setName("Test Complex Error")
        .setDesc("Test with a complex error with nested stack traces")
        .addButton((button) =>
          button.setButtonText("Test Complex Error").onClick(() => {
            debugModals.complexError(this.app);
          }),
        );
    }
  }

  private async openFolderPicker(): Promise<void> {
    const folders = this.getAllFolders();
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

      onChooseSuggestion(folder: TFolder) {
        this.onChoose(folder);
      }
    }

    new FolderSuggestModal(this.app, async (folder: TFolder) => {
      this.plugin.settings.schemaDir = folder.path;
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
}
