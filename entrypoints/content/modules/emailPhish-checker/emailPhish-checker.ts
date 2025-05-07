import {Module, ModuleId} from "../../types/module.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {ModuleMessage, ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import { BgMessageId } from "../../types/bg-message.ts";
import MimeParser  from 'postal-mime';

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
        const isOutlook3 = window.location.hostname.includes('outlook.live.com');
        const isProton = window.location.hostname.includes('mail.proton.me');
        
        if (isGmail) {
            return this.parseGmailEmail();
        } else if (isOutlook1 || isOutlook2 || isOutlook3) {
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
            // First, try to get the message ID from the URL
            const messageId = this.getOutlookMessageId();
            
            if (!messageId) {
                console.error("Could not find message ID in URL");
                return {
                    sender: "Error",
                    subject: "Error",
                    body: "Could not identify the email message ID"
                };
            }
            
            // Request the background script to download the EML file
            this.sendToRuntime({
                id: BgMessageId.DownloadOutlookEml,
                data: { messageId }
            });
            
            // Since the download is asynchronous, we'll return a placeholder
            // The actual email content will be processed once the EML is downloaded
            return {
                sender: "Processing...",
                subject: "Processing Outlook Email...",
                body: "Please wait while we process your email..."
            };
            
        } catch (error) {
            console.error("Error initiating Outlook email download:", error);
            return {
                sender: "Error",
                subject: "Error",
                body: "Failed to initiate Outlook email download"
            };
        }
    }
    
    private getOutlookMessageId(): string | null {
        // Extract message ID from URL
        const url = window.location.href;
        
        // Pattern for Office 365 and Outlook.com
        const regex = /(?:\/(?:id|item)\/|messageId=)([A-Za-z0-9\-_]+)/;
        const match = url.match(regex);
        
        return match ? match[1] : null;
    }
    
    // New method to handle EML data received from background script
    private async processEmlData(emlData: string) {
        try {
            const parser = new MimeParser();
            const parsed = await parser.parse(emlData);
            
            const senderMail = Array.isArray(parsed.from) && parsed.from.length > 0 ? 
                parsed.from[0].address : 'Unknown sender email';
            const sender = Array.isArray(parsed.from) && parsed.from.length > 0 ? 
                parsed.from[0].name || parsed.from[0].address : 'Unknown sender';
            const subject = parsed.subject || 'No subject';
            const body = parsed.html || parsed.text || 'No body content';
            const date = parsed.date ? new Date(parsed.date).toLocaleString() : 'Unknown date';
            
            const emailData = { senderMail, sender, date, subject, body };
            
            // Send the parsed email data to the UI
            this.sendToRuntime({
                id: UiMessageId.DOMIsRead,
                data: emailData
            });
            
            return emailData;
        } catch (error) {
            console.error("Error parsing EML data:", error);
            this.sendToRuntime({
                id: UiMessageId.DOMError,
                data: { error: "Failed to parse EML data" }
            });
            return null;
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