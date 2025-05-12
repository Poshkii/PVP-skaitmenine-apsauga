import {Module, ModuleId} from "../../types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import infoBtn from "@/public/btn_images/info_btn.png";
import zxcvbn from 'zxcvbn';
import i18next from "i18next";

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

   private async showStrengthMeter(passwordField: HTMLInputElement, password: string) {
    await i18next.loadNamespaces('passwords');
    const t = i18next.getFixedT(null, 'passwords');

    const existing = document.getElementById("password-strength-meter");
    if (existing) existing.remove();

    const result = zxcvbn(password);
    const score = result.score;

    const getColor = (score: number) => {
        switch (score) {
            case 0:
            case 1: return "#dc2626"; // red
            case 2: return "#facc15"; // yellow
            case 3: return "#22c55e"; // green
            case 4: return "#16a34a"; // dark green
            default: return "#ccc";
        }
    };

    const getLabel = (score: number) => {
        return ["Very Weak", "Weak", "Average", "Strong", "Very Strong"][score] || "";
    };

    const box = document.createElement("div");
    box.id = "password-strength-meter";
    box.style.position = "absolute";
    box.style.zIndex = "9999";
    box.style.background = "#0f172a";
    box.style.border = "1px solid #ddd";
    box.style.padding = "10px";
    box.style.borderRadius = "6px";
    box.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
    box.style.fontSize = "13px";
    box.style.width = "250px";

    const rect = passwordField.getBoundingClientRect();
    box.style.top = `${window.scrollY + rect.bottom + 6}px`;
    box.style.left = `${window.scrollX + rect.left}px`;

    const strengthBar = document.createElement("div");
    strengthBar.style.width = "100%";
    strengthBar.style.height = "8px";
    strengthBar.style.background = "#e5e7eb";
    strengthBar.style.borderRadius = "4px";
    strengthBar.style.margin = "8px 0";
    const fill = document.createElement("div");
    fill.style.height = "100%";
    fill.style.width = `${((score + 1) / 5) * 100}%`;
    fill.style.background = getColor(score);
    fill.style.borderRadius = "4px";
    strengthBar.appendChild(fill);

    const label = document.createElement("div");
    label.textContent = `Strength: ${getLabel(score)}`;

    const feedbackList = document.createElement("ul");
    feedbackList.style.margin = "8px 0 0 0";
    feedbackList.style.padding = "0 0 0 16px";

    const customSuggestions = this.customPasswordAnalysis(password, t);

    customSuggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.textContent = suggestion;
        feedbackList.appendChild(li);
    });

    box.appendChild(label);
    box.appendChild(strengthBar);
    box.appendChild(feedbackList);

    document.body.appendChild(box);

    // Cleanup on blur
    passwordField.addEventListener("blur", () => {
        setTimeout(() => box.remove(), 100);
    });
}


    private customPasswordAnalysis(password: string, t: (key: string) => string): string[] {
        const suggestions: string[] = [];

        // Emphasize length
        if (password.length < 8) {
            suggestions.push("Use at least 8 characters. Longer passwords are much stronger.");
        } else if (password.length < 12) {
            suggestions.push("Consider using 12 or more characters for better security.");
        }

        // Optional: flag common weak patterns (even though zxcvbn catches many)
        if (/^[a-z]{1,}$/i.test(password)) {
            suggestions.push("Avoid simple dictionary words alone. Try a longer passphrase.");
        }

        // Optional: warn about very repetitive characters
        if (/([a-zA-Z0-9])\1{3,}/.test(password)) {
            suggestions.push("Avoid repeating the same character multiple times.");
        }

        // Optional: warn if it's all one character type
        if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
            suggestions.push("Mixing character types can help avoid guessable patterns.");
        }

        return suggestions;
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

            // this.sendToRuntime({
            //     id: BgMessageId.NavigateTo,
            //     data: {
            //         route: `/password-checker/${passwordField.value}`
            //     }
            // });

            // Optional: Remove button after click
            //button.remove();
            void this.showStrengthMeter(passwordField, passwordField.value);

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