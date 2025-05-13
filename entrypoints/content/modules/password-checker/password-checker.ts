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
    const styles = document.createElement('style');
        styles.textContent = `
        :root {
            --ff-bg-primary: #0f172a;
            --ff-bg-secondary: #1e293b;
            --ff-bg-tertiary: #334155;
            --ff-text-primary: #f8fafc;
            --ff-text-secondary: #cbd5e1;
            --ff-text-muted: #64748b;
            --ff-accent-primary: #0ea5e9;
            --ff-accent-secondary: #2dd4bf;
            --ff-accent-gradient: linear-gradient(135deg, #0ea5e9, #2dd4bf);
            --ff-success: #10b981;
            --ff-warning: #f59e0b;
            --ff-error: #ef4444;
            --ff-border-radius-sm: 6px;
            --ff-border-radius-md: 12px;
            --ff-border-radius-lg: 16px;
            --ff-transition-fast: 0.2s;
            --ff-transition-medium: 0.3s;
            --ff-shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.1);
            --ff-shadow-md: 0 10px 15px rgba(0, 0, 0, 0.1);
            --ff-shadow-lg: 0 20px 25px rgba(0, 0, 0, 0.1);
            --ff-font-heading: 'Inter', sans-serif;
            --ff-font-body: 'Inter', sans-serif;
        }

        .ff-btn {
            padding: 12px 24px;
            border-radius: var(--ff-border-radius-md);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--ff-transition-medium);
            border: none;
            position: relative;
            overflow: hidden;
        }

        .ff-btn::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: -100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .ff-btn:hover::after {
            left: 100%;
        }

        .ff-btn-primary {
            background: var(--ff-accent-gradient);
            color: white;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
        }

        .ff-btn-primary:hover {
            box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
            transform: translateY(-2px);
        }

        .ff-btn-primary:active {
            transform: translateY(0);
        }

        .ff-btn-secondary {
            background-color: transparent;
            color: var(--ff-text-primary);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .ff-btn-secondary:hover {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: var(--ff-accent-primary);
            color: var(--ff-accent-primary);
        }
        
       .ff-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center; /* centers children horizontally */
        }
       .ff-colored-bullet {
            list-style: none;
            position: relative;
            padding-left: 1.2em;
        }
        .ff-colored-bullet::before {
            content: "•";
            font-size: 16px;
            position: absolute;
            left: 0;
            color: white;
        }
        `;
        document.head.appendChild(styles);

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
    box.style.color = "#ffffff"
    box.style.border = "1px solid #ddd";
    box.style.padding = "10px";
    box.style.borderRadius = "6px";
    box.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
    box.style.fontSize = "13px";
    box.style.width = "250px";

    const rect = passwordField.getBoundingClientRect();
    box.style.top = `${window.scrollY + rect.top}px`;
    box.style.left = `${window.scrollX + rect.right + 8}px`; 

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
    label.style.fontSize = "24px";
    label.textContent = `Strength: ${getLabel(score)}`;    

    const feedbackList = document.createElement("ul");
    feedbackList.style.margin = "8px 0 0 0";
    feedbackList.style.padding = "0 0 0 12px";

    const customSuggestions = this.customPasswordAnalysis(password, t);

    customSuggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.textContent = suggestion;     
        li.style.paddingTop = "8px"
        li.className = "ff-colored-bullet";   
        feedbackList.appendChild(li);
    });

    const buttonWrapper = document.createElement("div");
    buttonWrapper.style.display = "flex";
    buttonWrapper.style.justifyContent = "center";
    buttonWrapper.style.marginTop = "10px"; // optional spacing

    const closeButton = document.createElement("button");
    closeButton.className = "ff-btn ff-btn-secondary";
    closeButton.innerText = "Close";
    closeButton.style.marginTop = "10px";
    closeButton.addEventListener("click", () => {
        box.remove();
    });

    box.appendChild(label);
    box.appendChild(strengthBar);
    box.appendChild(feedbackList);
    buttonWrapper.appendChild(closeButton);
    box.appendChild(buttonWrapper);

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
            void this.showStrengthMeter(passwordField, passwordField.value);

            // Add an input event listener to update strength meter as the user types
            const onInput = () => {
                void this.showStrengthMeter(passwordField, passwordField.value);
            };
            passwordField.addEventListener("input", onInput);

            // Optionally remove the listener on blur to prevent memory leaks
            const onBlur = () => {
                passwordField.removeEventListener("input", onInput);
                passwordField.removeEventListener("blur", onBlur);
            };
            passwordField.addEventListener("blur", onBlur);

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