import {Module, ModuleId} from "../../types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";

export class EmailChecker extends Module {
    readonly id = ModuleId.EmailChecker;
    private buttonId = "email-action-button";

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

    private createButton(emailField: HTMLInputElement) {
        // Check if the button already exists
        if (document.getElementById(this.buttonId)) return;

        // Create the button element
        const button = document.createElement("button");
        button.id = this.buttonId; // Give it a unique ID
        button.innerText = "?"; // Button text
        button.style.position = "absolute"; // Absolute positioning
        button.style.top = `${emailField.getBoundingClientRect().top + window.scrollY + emailField.offsetHeight + 5}px`;
        button.style.left = `${emailField.getBoundingClientRect().left + window.scrollX + emailField.offsetWidth - 32}px`;
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
            console.log("Email button clicked, sending message to background script...");

            this.sendToRuntime({
                id: BgMessageId.NavigateTo,
                data: {
                    route: `/email-checker/${emailField.value}`
                }
            });

            // Optional: Remove button after click
            button.remove();
        });
    }

    private onFocusIn = (event: FocusEvent) => {
        const target = event.target as HTMLInputElement;
        if (target && (target.type === "email" || target.type === "login" || target.name == "email")) {
            console.log("Email field focused");

            // Add the button near the password field
            this.createButton(target);
        }
    }

    private onFocusOut = (event: FocusEvent) => {
        const target = event.target as HTMLInputElement;
        if (target && (target.type === "email" || target.type === "login" || target.name == "email")) {
            console.log("Email field blurred");
            setTimeout(() => {
                const button = document.getElementById(this.buttonId);
                if (button) button.remove();
            }, 100);
        }
    }
}