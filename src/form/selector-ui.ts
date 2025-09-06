import { App, Modal, TFile, Setting } from "obsidian";

export class FileSelectorModal extends Modal {
	files: TFile[];
	onChoose: (file: TFile | null) => void;

	constructor(
		app: App,
		files: TFile[],
		onChoose: (file: TFile | null) => void,
	) {
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
					btn.setButtonText("Select").onClick(() => {
						this.onChoose(file);
						this.close();
					}),
				);
		});

		// Cancel button
		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText("Cancel").onClick(() => {
				this.onChoose(null);
				this.close();
			}),
		);
	}

	onClose() {
		this.contentEl.empty();
	}
}
