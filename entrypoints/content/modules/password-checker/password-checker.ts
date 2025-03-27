import {Module, ModuleId} from "../../types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import infoBtn from "@/public/btn_images/info_btn.png"

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
        const offset = 6;
        var offsetHeight = passwordField.clientHeight - offset;        
        var height = passwordField.clientHeight;        

        const bgColor = window.getComputedStyle(passwordField).backgroundColor;

        function isLightColor(color: string) {
            if (color === 'rgba(0, 0, 0, 0)' || !color)
                return true;
            const rgb = color.match(/\d+/g);
            if (rgb == null)
                return false
            const r = parseInt(rgb[0]);
            const g = parseInt(rgb[1]);
            const b = parseInt(rgb[2]);
        
            // Calculate luminance using the RGB values (basic check for light or dark)
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            return luminance > 128; // If luminance is greater than 128, it's considered light
        }

        // Check if the button already exists
        if (document.getElementById(this.buttonId)) return;  
        
        // Create button icon
        const img = document.createElement("img");
        img.src = infoBtn; 
        img.alt = "?";              
        img.style.width = "100%";
        img.style.height = "100%";        

        // Create the button element
        const button = document.createElement("button");        
        button.id = this.buttonId; // Give it a unique ID
        button.appendChild(img);
        button.style.display = "inline-flex"; // Ensures it sizes properly with the image
        button.style.alignItems = "center"; // Centers image inside
        button.style.justifyContent = "center";
        button.style.position = "absolute"; // Absolute positioning
        button.style.padding = "0";
        button.style.margin = "0";
        button.style.width = offsetHeight.toString() + "px";
        button.style.height = offsetHeight.toString() + "px";
        button.style.backgroundColor = "rgba(0,0,0,0)";
        button.style.border = "0px solid white";
        button.style.borderRadius = "4px";
        button.style.cursor = "pointer";
        button.style.zIndex = "9999"; // Make sure it's on top of other elements

        if (isLightColor(bgColor)) {
            // If background is light (white), make the button black
            img.style.filter = "invert(1)"; 
        } 

        // Append the button to the body
        document.body.appendChild(button);

        // Add a click event listener (optional)
        console.log("Button created:", button);

        const updateButtonPosition = () => {
            const rect = passwordField.getBoundingClientRect();
            const zoomLevel = window.visualViewport?.scale || 1; // Adjust size based on zoom level
    
            button.style.top = `${window.scrollY + rect.top + offset / 2 + 1}px`;
            button.style.left = `${window.scrollX + rect.left + passwordField.offsetWidth - height + offset / 2 - 1}px`;
    
            // Adjust button size dynamically based on zoom
            const baseSize = 14; // Base font size in pixels
            button.style.fontSize = `${baseSize / zoomLevel}px`;
        };

        updateButtonPosition();

        window.addEventListener("scroll", updateButtonPosition);
        window.addEventListener("resize", updateButtonPosition);

        // Add event listener to send message to background
        button.addEventListener("click", () => {
            console.log("Button clicked, sending message to background script...");

            this.sendToRuntime({
                id: BgMessageId.NavigateTo,
                data: {
                    route: `/password-checker/${passwordField.value}`
                }
            });

            // Optional: Remove button after click
            button.remove();
        });

         // Cleanup on blur
        passwordField.addEventListener("blur", () => {
            setTimeout(() => {
                button.remove();
                window.removeEventListener("scroll", updateButtonPosition);
                window.removeEventListener("resize", updateButtonPosition);
            }, 100);
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