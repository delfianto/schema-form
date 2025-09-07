import { type ButtonComponent, Setting } from "obsidian";

type ClickHandler = () => void;

type ButtonType = "CTA" | "STANDARD" | "WARNING";

export function settingBtn(
  container: HTMLElement,
  name: string,
  description: string = "Button Description",
  buttonText: string = "Button",
  cssClass: string = "",
  clickHandler: ClickHandler
) {
  createSettingBtn(container, name, description, buttonText, cssClass, "STANDARD", clickHandler);
}

export function settingBtnCta(
  container: HTMLElement,
  name: string,
  description: string = "Button Description",
  buttonText: string = "Button",
  cssClass: string = "",
  clickHandler: ClickHandler
) {
  createSettingBtn(container, name, description, buttonText, cssClass, "CTA", clickHandler);
}

export function settingBtnWarn(
  container: HTMLElement,
  name: string,
  description: string = "Button Description",
  buttonText: string = "Button",
  cssClass: string = "",
  clickHandler: ClickHandler
) {
  createSettingBtn(container, name, description, buttonText, cssClass, "WARNING", clickHandler);
}

function createSettingBtn(
  container: HTMLElement,
  name: string,
  description: string = "Button Description",
  buttonText: string = "Button",
  cssClass: string = "",
  buttonType: ButtonType,
  clickHandler: ClickHandler
) {
  return new Setting(container)
    .setName(name)
    .setDesc(description)
    .addButton((button: ButtonComponent) => {
      if (buttonType === "CTA") {
        button.setCta();
      } else if (buttonType === "WARNING") {
        button.setWarning();
      }

      button.setButtonText(buttonText).setClass(cssClass).onClick(clickHandler);
    });
}
