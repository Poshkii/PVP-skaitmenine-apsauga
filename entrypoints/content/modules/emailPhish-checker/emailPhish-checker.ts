import {Module, ModuleId} from "../../types/module.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {ModuleMessage, ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";

export class PhishChecker extends Module { 
    readonly id = ModuleId.PhishChecker;

    load(): void {
    }

    unload(): void {
    }

    private readDom() {
        const emailData = this.parseEmailData();

        this.sendToRuntime({
            id: UiMessageId.DOMIsRead,
            data: emailData
        })
    }
    
    private parseEmailData() {
        // Detect if we're on Gmail or Outlook
        const isGmail = window.location.hostname.includes('mail.google.com');
        const isOutlook1 = window.location.hostname.includes('outlook.office365.com');
        const isOutlook2 = window.location.hostname.includes('outlook.office.com');
        const isProton = window.location.hostname.includes('mail.proton.me');
        
        if (isGmail) {
            return this.parseGmailEmail();
        } else if (isOutlook1 || isOutlook2) {
            return this.parseOutlookEmail();
        } else if (isProton) {
            return this.parseProtonEmail();
        } else {
            return {
                sender: "Unknown email service",
                subject: "Could not detect email service",
                body: "This page doesn't appear to be Gmail or Outlook"
            };
        }
    }
    
    private parseGmailEmail() {

        const gmailHash = window.location.hash;
        const isEmailOpen = /#(inbox|starred|sent|imp|snoozed|drafts|spam|trash|all)\/[a-zA-Z0-9]+/.test(gmailHash);
        const hasEmailElements = !!document.querySelector('.gD') && !!document.querySelector('.hP');

        if (!isEmailOpen || !hasEmailElements) {
            this.sendToRuntime({
                id: UiMessageId.DOMError
            })
            return
        }

        try {
            // Basic Gmail selectors - you may need to adjust these
            const senderMail = document.querySelector('.gD')?.getAttribute('email') || 'Unknown sender email';
            const sender = document.querySelector('.gD')?.getAttribute('name') || 'Unknown sender';
            const date = document.querySelector('.g3')?.getAttribute('title') || 'No date';
            const subject = document.querySelector('.hP')?.textContent || 'No subject';
            const body = this.getGmailBody();
            
            return { senderMail, sender, date, subject, body };
        } catch (error) {
            console.error("Error parsing Gmail:", error);
            return { sender: "Error", subject: "Error", body: "Failed to parse Gmail content" };
        }
    }
    private getGmailBody(): string {
        const bodyElement = document.querySelector('.a3s.aiL');
        
        if (!bodyElement) {
            return 'No body content found';
        }
        
        const bodyClone = bodyElement.cloneNode(true) as HTMLElement;
        
        // Create a wrapper with scaling styles
        const wrapper = document.createElement('div');
        wrapper.className = 'gmail-scaled-content';
        
        // Apply scaling styles
        wrapper.style.cssText = `
            font-size: 0.85em; /* Reduce font size */
            transform-origin: top left;
            line-height: 1.4;
        `;
        
        // Move all body content into the wrapper
        while (bodyClone.firstChild) {
            wrapper.appendChild(bodyClone.firstChild);
        }
        
        // Reset image sizes to prevent oversized images
        const images = wrapper.querySelectorAll('img');
        images.forEach(img => {
            img.removeAttribute('height');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
        
        // Scale down large tables
        const tables = wrapper.querySelectorAll('table');
        tables.forEach(table => {
            table.style.width = 'auto';
            table.style.maxWidth = '100%';
            table.style.fontSize = '0.9em';
        });
        
        // Target Gmail emojis specifically
        const gmailEmojis = wrapper.querySelectorAll('img.an1[data-emoji], img[data-emoji]');
        gmailEmojis.forEach(emoji => {
            (emoji as HTMLElement).style.height = '1.2em';
            (emoji as HTMLElement).style.width = 'auto';
            (emoji as HTMLElement).style.maxHeight = '1.2em';
            (emoji as HTMLElement).style.maxWidth = '1.2em';
            (emoji as HTMLElement).style.display = 'inline-block';
            (emoji as HTMLElement).style.verticalAlign = 'middle';
        });
        
        // Add the wrapper back to the body
        bodyClone.appendChild(wrapper);
        
        // Add a style element with targeted emoji styling
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .gmail-scaled-content {
                max-width: 100%;
            }
            .gmail-scaled-content * {
                max-width: 100%;
            }
            .gmail-scaled-content h1 {
                font-size: 1.4em;
            }
            .gmail-scaled-content h2 {
                font-size: 1.3em;
            }
            .gmail-scaled-content h3 {
                font-size: 1.2em;
            }
            .gmail-scaled-content pre, 
            .gmail-scaled-content code {
                white-space: pre-wrap;
                word-break: break-word;
            }
            
            
        `;
        bodyClone.appendChild(styleElement);
        
        return bodyClone.innerHTML;
    }
    private parseProtonEmail() {

        const iframe = document.querySelector('[data-testid="content-iframe"]') as HTMLIFrameElement;
        if (!iframe || iframe.style.display === 'none' || !iframe.contentDocument?.body?.innerText?.trim()) {
            this.sendToRuntime({
                id: UiMessageId.DOMError
            })
            return
        }

        try {
            console.log("Parsing ProtonMail email");
            
            const senderMail = document.querySelector('[data-testid="recipient-address"]')?.textContent || 'Unknown sender email';
            const sender = document.querySelector('[data-testid="recipient-label"]')?.textContent || 'Unknown sender';
            const date = document.querySelector('[data-testid="item-date-simple"]')?.getAttribute('datetime') || 'No date';
            const subject = document.querySelector('[data-testid="conversation-header:subject"]')?.getAttribute('title') || 'No subject';
            const body = this.getProtonMailBody();
            return { senderMail, sender, date, subject, body };
        } catch (error) {
            console.error("Error parsing ProtonMail:", error);
            return { sender: "Error", subject: "Error", body: "Failed to parse ProtonMail content" };
        }
    }

    private getProtonMailBody(): string {
        const iframe = document.querySelector('[data-testid="content-iframe"]') as HTMLIFrameElement;
        
        if (!iframe || !iframe.contentDocument || !iframe.contentWindow) {
            return 'No body content found or unable to access iframe content';
        }
        
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const bodyClone = iframeDocument.body.cloneNode(true) as HTMLElement;
        
        // Remove the hidden SVG definitions
        const hiddenSvgs = bodyClone.querySelectorAll('.proton-hidden');
        hiddenSvgs.forEach(svg => svg.remove());
    
        // Scale down the content by adding a wrapper with scaling styles
        const wrapper = document.createElement('div');
        wrapper.className = 'proton-mail-scaled-content';
        
        // Apply scaling styles
        wrapper.style.cssText = `
            font-size: 0.85em; /* Reduce font size */
            transform-origin: top left;
            line-height: 1.4;
        `;
        
        // Move all body content into the wrapper
        while (bodyClone.firstChild) {
            wrapper.appendChild(bodyClone.firstChild);
        }
        
        // Reset image sizes to prevent oversized images
        const images = wrapper.querySelectorAll('img');
        images.forEach(img => {
            // Remove height/width attributes that might make images too large
            img.removeAttribute('height');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
        
        // Scale down large tables
        const tables = wrapper.querySelectorAll('table');
        tables.forEach(table => {
            table.style.width = 'auto';
            table.style.maxWidth = '100%';
            table.style.fontSize = '0.9em';
        });
        
        // Add the wrapper back to the body
        bodyClone.appendChild(wrapper);
        
        /*
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .proton-mail-scaled-content {
                max-width: 100%;
            }
            .proton-mail-scaled-content * {
                max-width: 100%;
            }
            .proton-mail-scaled-content h1 {
                font-size: 1.4em;
            }
            .proton-mail-scaled-content h2 {
                font-size: 1.3em;
            }
            .proton-mail-scaled-content h3 {
                font-size: 1.2em;
            }
            .proton-mail-scaled-content pre, 
            .proton-mail-scaled-content code {
                white-space: pre-wrap;
                word-break: break-word;
            }
        `;
        bodyClone.appendChild(styleElement);
        */
        
        return bodyClone.innerHTML;
    }
    private parseOutlookEmail() {
        try {
            /*
            const senderMail = document.querySelector('[data-testid="recipient-address"]')?.textContent || 'Unknown sender email';
            const sender = document.querySelector('[data-testid="recipient-label"]')?.textContent || 'Unknown sender';
            const date = document.querySelector('[data-testid="item-date-simple"]')?.getAttribute('datetime') || 'No date';
            const subject = document.querySelector('[data-testid="conversation-header:subject"]')?.getAttribute('title') || 'No subject';
            const body = this.getProtonMailBody();
            */
            // Basic Outlook selectors - you may need to adjust these
            const sender = document.querySelector('.OZZZK')?.textContent?.trim() || 'Unknown sender';
            const subject = document.querySelector('._2LhyGc5yl3hbzUyNGQi-9s')?.textContent || 'No subject';
            const body = document.querySelector('._4utP_vaqQ3UQZH0GEBVQe')?.innerHTML || 'No body content found';
            
            return { sender, subject, body };
        } catch (error) {
            console.error("Error parsing Outlook:", error);
            return { sender: "Error", subject: "Error", body: "Failed to parse Outlook content" };
        }
    }

    handleMessage(message: ModuleMessage): any {
        super.handleMessage(message);

        switch (message.id){
            case ModuleMessageId.ReadDom: {
                this.readDom();
            }
        }
    }
}