import { type App, PluginSettingTab, Setting, SuggestModal, TFolder } from "obsidian";
import { FormHandler } from "../form";
import type SchemaFormPlugin from "../main";
import * as ui from "../ui";
import { debugModals } from "./debug-ui";

export class SchemaFormSettingTab extends PluginSettingTab {
  plugin: SchemaFormPlugin;

  constructor(plugin: SchemaFormPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl: container } = this;

    container.empty();
    container.createEl("h2", { text: "Schema Form Settings" });

    this.addDebugToggle(container);
    this.addSchemaDirPicker(container);
    this.addDebugSection(container);
  }

  private addDebugToggle(container: HTMLElement): void {
    new Setting(container)
      .setName("Debug Mode")
      .setDesc("Enable debug mode for troubleshooting")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.debugFlag).onChange(async (value) => {
          this.plugin.settings.debugFlag = value;
          await this.plugin.saveSettings();
        })
      );
  }

  private addDebugSection(container: HTMLElement): void {
    if (!this.plugin.settings.debugFlag) {
      return;
    }

    container.createEl("h2", { text: "Debug Tools" });

    ui.settingBtnWarn(
      container,
      "Test General Error Modal",
      "Test the schema error modal with dummy data",
      "Show Error",
      ui.cssClass(ui.SCHEMA_FORM_STYLE.SETTINGS_DEBUG_BTN),
      () => {
        debugModals.basicError(this.app);
      }
    );

    ui.settingBtnCta(
      container,
      "Test Schema Parse Error Modal",
      "Test with a realistic JSON parsing error",
      "JSON Error",
      ui.cssClass(ui.SCHEMA_FORM_STYLE.SETTINGS_DEBUG_BTN),
      () => {
        debugModals.parseError(this.app);
      }
    );

    ui.settingBtnCta(
      container,
      "Show Complex Error Modal",
      "Test with a complex error with nested stack traces",
      "Complex Error",
      ui.cssClass(ui.SCHEMA_FORM_STYLE.SETTINGS_DEBUG_BTN),
      () => {
        debugModals.complexError(this.app);
      }
    );

    ui.settingBtnCta(
      container,
      "Test Schema Modal Form",
      "Test loading schemas from the configured directory",
      "Load Schema",
      ui.cssClass(ui.SCHEMA_FORM_STYLE.SETTINGS_DEBUG_BTN),
      async () => {
        const formHandler = new FormHandler(this.app, this.plugin.settings.schemaDir);
        const formData = await formHandler.showForm();
        console.log("Form result:", formData);
      }
    );
  }

  private addSchemaDirPicker(container: HTMLElement): void {
    new Setting(container)
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
          })
      );

    if (!this.plugin.settings.schemaDir) {
      return;
    }

    // Show current schema folder info
    const folderInfo = container.createEl("div", {
      cls: "setting-item-info",
    });
    folderInfo.createEl("div", {
      text: `Current folder: ${this.plugin.settings.schemaDir}`,
      cls: "setting-item-description",
    });

    // Validate folder exists
    const folder = this.app.vault.getAbstractFileByPath(this.plugin.settings.schemaDir);

    if (folder && folder instanceof TFolder) {
      folderInfo.createEl("div", {
        text: "✓ Folder exists",
        cls: ui.cssClass(
          ui.SCHEMA_FORM_STYLE.SETTINGS_ITEM_DESC,
          ui.SCHEMA_FORM_STYLE.SCHEMA_DIR_SUCCESS
        ),
      });
    } else {
      folderInfo.createEl("div", {
        text: "⚠ Folder not found",
        cls: ui.cssClass(
          ui.SCHEMA_FORM_STYLE.SETTINGS_ITEM_DESC,
          ui.SCHEMA_FORM_STYLE.SCHEMA_DIR_ERROR
        ),
      });
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
        return folders.filter((folder) => folder.path.toLowerCase().includes(query.toLowerCase()));
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

      // Refresh the settings display
      this.display();
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
