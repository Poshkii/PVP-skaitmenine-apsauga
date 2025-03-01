import {Module, ModuleId} from "../../types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";

export class PasswordChecker extends Module {
    readonly id = ModuleId.PasswordChecker;
    private buttonId = "password-action-button";

    load(): void {
        document.addEventListener("focusin", this.onFocusIn);
        document.addEventListener("focusout", this.onFocusOut);
    }

    unload(): void {
        document.removeEventListener("focusin", this.onFocusIn);
        document.removeEventListener("focusout", this.onFocusOut);

        const button = document.getElementById(this.buttonId);
        if (button) button.remove();
    }

    private createButton(passwordField: HTMLInputElement) {
        // Check if the button already exists
        if (document.getElementById(this.buttonId)) return;

        // Create the button element
        const button = document.createElement("button");
        button.id = this.buttonId; // Give it a unique ID
        button.innerText = "?"; // Button text
        button.style.position = "absolute"; // Absolute positioning
        button.style.top = `${passwordField.getBoundingClientRect().top + window.scrollY + passwordField.offsetHeight + 5}px`;
        button.style.left = `${passwordField.getBoundingClientRect().left + window.scrollX + passwordField.offsetWidth - 32}px`;
        button.style.padding = "8px 12px";
        button.style.backgroundColor = "#4CAF50";
        button.style.color = "white";
        button.style.border = "none";
        button.style.borderRadius = "4px";
        button.style.cursor = "pointer";
        button.style.zIndex = "9999"; // Make sure it's on top of other elements

        // Append the button to the body
        document.body.appendChild(button);

        // Add a click event listener (optional)
        console.log("Button created:", button);

        // Add event listener to send message to background
        button.addEventListener("click", () => {
            console.log("Button clicked, sending message to background script...");

            this.sendToBackground({id: BgMessageId.OpenPopup});

            // Optional: Remove button after click
            button.remove();
        });
    }

    private onFocusIn = (event: FocusEvent) => {
        const target = event.target as HTMLInputElement;
        if (target && target.type === "password") {
            console.log("Password field focused");

            // Add the button near the password field
            this.createButton(target);
        }
    }

    private onFocusOut = (event: FocusEvent) => {
        const target = event.target as HTMLInputElement;
        if (target && target.type === "password") {
            console.log("Password field blurred");
            setTimeout(() => {
                const button = document.getElementById(this.buttonId);
                if (button) button.remove();
            }, 100);
        }
    }
}