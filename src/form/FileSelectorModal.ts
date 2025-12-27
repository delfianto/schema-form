import { type App, Modal, Setting, type TFile } from "obsidian";

export class FileSelectorModal extends Modal {
  files: TFile[];
  onChoose: (file: TFile | null) => void;
  private resolved = false;

  constructor(app: App, files: TFile[], onChoose: (file: TFile | null) => void) {
    super(app);
    this.files = files;
    this.onChoose = onChoose;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Choose a schema file:" });

    this.files.forEach((file) => {
      new Setting(contentEl)
        .setName(file.name)
        .setDesc(file.path)
        .addButton((btn) =>
          btn
            .setButtonText("Select")
            .setCta()
            .onClick(() => {
              this.resolve(file);
            })
        );
    });

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Cancel")
        .setWarning()
        .onClick(() => {
          this.resolve();
        })
    );
  }

  onClose() {
    this.contentEl.empty();

    if (!this.resolved) {
      this.resolved = true;
      this.onChoose(null);
    }
  }

  resolve(file?: TFile) {
    if (!this.resolved) {
      if (file !== undefined) {
        this.onChoose(file);
      } else {
        this.onChoose(null);
      }

      this.resolved = true;
      this.close();
    }
  }
}
