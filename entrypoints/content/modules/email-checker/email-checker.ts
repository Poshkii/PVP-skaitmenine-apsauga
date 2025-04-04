import {Module, ModuleId} from "../../types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import infoBtn from "@/public/btn_images/info_btn.png"
import { RailSymbolIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";



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
        const offset = 6;
        var offsetHeight = emailField.clientHeight - offset;        
        var height = emailField.clientHeight;

        const bgColor = window.getComputedStyle(emailField).backgroundColor;

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
        
        const tooltip = document.createElement("span");
        tooltip.innerText = "Scan for breaches";
        tooltip.style.position = "absolute";
        tooltip.style.backgroundColor = "#0f172a";
        tooltip.style.color = "white";
        tooltip.style.padding = "4px 8px";
        tooltip.style.borderRadius = "4px";
        tooltip.style.fontSize = "12px";
        tooltip.style.whiteSpace = "nowrap";
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";
        tooltip.style.transition = "opacity 0.5s";
        tooltip.style.top = "0px"; 
        tooltip.style.left = "0px";
        tooltip.style.transform = "translateX(30%)";
        tooltip.style.zIndex = "10000";

        // Create the button element
        const button = document.createElement("button");        
        button.id = this.buttonId; // Give it a unique ID
        button.appendChild(tooltip);
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
            const rect = emailField.getBoundingClientRect();
            const zoomLevel = window.visualViewport?.scale || 1; // Adjust size based on zoom level
    
            button.style.top = `${window.scrollY + rect.top + offset / 2 + 1}px`;
            button.style.left = `${window.scrollX + rect.left + emailField.offsetWidth - height + offset / 2 - 1}px`;
    
            // Adjust button size dynamically based on zoom
            const baseSize = 14; // Base font size in pixels
            button.style.fontSize = `${baseSize / zoomLevel}px`;
        };

        updateButtonPosition();

        window.addEventListener("scroll", updateButtonPosition);
        window.addEventListener("resize", updateButtonPosition);

        button.addEventListener("mouseenter", () => {
            tooltip.style.visibility = "visible";
            tooltip.style.opacity = "1";
        });
        button.addEventListener("mouseleave", () => {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
        });

        // Add event listener to send message to background
        button.addEventListener("click", async () => {
            // console.log("Email button clicked, sending message to background script...");
            // this.sendToRuntime({
            //     id: BgMessageId.NavigateTo,
            //     data: {
            //         route: `/email-checker/${emailField.value}`
            //     }
            // });

            console.log("Email button clicked, fetching breach data...");

            const email = emailField.value.trim();

            if (!email) {
                alert("Please enter an email address.");
                return;
            }


            // Make API request to check for email breaches
            try {
                const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${email}`);
                    const data = await response.json();  
                    
                    console.log("API response: ", response);

                    if (response.status === 200) {
                        console.log("Email was breached!");
                        chrome.runtime.sendMessage({ id: BgMessageId.StoreEmailData, email: email, data: data})
                        // Was breached
                        if (data.ExposedBreaches) {
                            // setResult(`Found ${data.ExposedBreaches.breaches_details.length} breaches`);
                            //data.ExposedBreaches.breaches_details.length < 10 ? setWarning(true) : setDanger(true)
                            // Get risk level
                            // const risk = data.BreachMetrics.risk[0]?.risk_label ?? "Unknown";
                            // risk === "High" ? setHighRisk(true) : risk === "Medium" ? setMediumRisk(true) : risk === "Low" ? setLowRisk(true) : setUnknownRisk(true);
                            // setRisk(risk);
                            // setBreachesFound(true);
                            // setBreachData(data);                
                            // addScannedEmail(email, data.ExposedBreaches.breaches_details.length);
                            this.displayBreachInfo(data, emailField)
                        }
                        // Wasn't breached
                        else {
                            //setSafe(true);
                            // addScannedEmail(email, 0);                 
                        }                
                    } 
                    // Email not found
                    else {
                        // setResult("The provided email address could not be verified.");   
                        //setUnknownEmail(true);           
                    }
                } catch (error) {
                    console.error("API error:", error);
                }

            // Optional: Remove button after click
            button.remove();
        });

        // Cleanup on blur
        emailField.addEventListener("blur", () => {
            setTimeout(() => {
                button.remove();
                window.removeEventListener("scroll", updateButtonPosition);
                window.removeEventListener("resize", updateButtonPosition);
            }, 100);
        });
    }

    private displayBreachInfo(breaches: any, emailField: HTMLInputElement) {
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
        `;
        document.head.appendChild(styles);

        // Create a div to hold the information
        const infoDiv = document.createElement("div");
        infoDiv.style.position = "absolute";
        infoDiv.style.backgroundColor = "#0f172a";
        infoDiv.style.border = "1px solid #ccc";
        infoDiv.style.display = "flex";
        infoDiv.style.flexDirection = "column";
        infoDiv.style.alignItems = "center";         // center horizontally
        //infoDiv.style.justifyContent = "center";     // center vertically
        //infoDiv.style.height = "200px";              // important for vertical centering
        infoDiv.style.borderRadius = "4px";
        infoDiv.style.padding = "16px";
        infoDiv.style.zIndex = "9999";
        infoDiv.style.maxWidth = "400px";
        infoDiv.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
        infoDiv.style.transform = "translateX(10px)";
    
        // Update the position of the div near the email field
        const updateDivPosition = () => {
            const rect = emailField.getBoundingClientRect();
            const zoomLevel = window.visualViewport?.scale || 1; // Adjust size based on zoom level
            
            // Position the div relative to the email field
            infoDiv.style.top = `${window.scrollY + rect.top}px`;
            infoDiv.style.left = `${window.scrollX + rect.left + emailField.offsetWidth}px`;
    
            // Adjust font size based on zoom level
            const baseSize = 14; // Base font size in pixels
            infoDiv.style.fontSize = `${baseSize / zoomLevel}px`;
        };
    
        // Position the infoDiv
        updateDivPosition();

        window.addEventListener("scroll", updateDivPosition);
        window.addEventListener("resize", updateDivPosition);        
    
        const wrapperDiv = document.createElement("div");
        wrapperDiv.className = "ff-wrapper";

        // Create summary div
        const breachesCount = breaches.ExposedBreaches.breaches_details.length;
        const riskLevel = breaches.BreachMetrics.risk[0]?.risk_label;  
        const riskColor = breaches.BreachMetrics.risk[0]?.risk_label === "High" ? "red" : breaches.BreachMetrics.risk[0]?.risk_label === "Low" ? "orange" : "green";   
        
        const summaryDiv = document.createElement("div");
        summaryDiv.style.textAlign = "center";
        summaryDiv.innerHTML = `<h2>Found ${breachesCount} breach${breachesCount > 1 ? "es" : ""}</h2><p>Risk level is <span style="color: ${riskColor}; font-weight: 600;">${riskLevel}</span></p>`;           

        // Create buttons
        const buttonsWrapper = document.createElement("div");
        buttonsWrapper.style.display = "flex";
        buttonsWrapper.style.gap = "10px"; // spacing between buttons
        buttonsWrapper.style.marginTop = "10px"; // spacing from text above
        buttonsWrapper.style.justifyContent = "center";
        buttonsWrapper.style.width = "100%";

        const closeButton = document.createElement("button");
        
        closeButton.className = "ff-btn ff-btn-secondary";
        closeButton.innerText = "Close";
        closeButton.addEventListener("click", () => {
            infoDiv.remove();
        });

        const detailsButton = document.createElement("button");
        
        detailsButton.className = "ff-btn ff-btn-primary";
        detailsButton.innerText = "Details";
        detailsButton.addEventListener("click", () => {
            this.sendToRuntime({
                id: BgMessageId.NavigateTo,
                data: {
                    route: `/email-checker/${emailField.value}`
                }
            });
        });       
         
        buttonsWrapper.appendChild(closeButton);
        buttonsWrapper.appendChild(detailsButton);
        infoDiv.appendChild(summaryDiv); 
        infoDiv.appendChild(buttonsWrapper);      
    
        // Append the infoDiv to the document body
        document.body.appendChild(infoDiv);
    }
    

    private onFocusIn = (event: FocusEvent) => {
        const target = event.target as HTMLInputElement;
        if (target && (target.type === "email" || target.name === "email" || target.type === "login" || target.name === "login")) {
            console.log("Email field focused");

            // Add the button near the password field
            this.createButton(target);
        }
    }

    private onFocusOut = (event: FocusEvent) => {
        const target = event.target as HTMLInputElement;
        if (target && (target.type === "email" || target.name === "email" || target.type === "login" || target.name === "login")) {
            console.log("Email field blurred");
            setTimeout(() => {
                const button = document.getElementById(this.buttonId);
                if (button) button.remove();
            }, 100);
        }
    }
}