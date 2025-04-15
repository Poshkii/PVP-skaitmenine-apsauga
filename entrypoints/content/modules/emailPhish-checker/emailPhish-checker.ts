import {Module, ModuleId} from "../../types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";

export class PhishChecker extends Module { 
    readonly id = ModuleId.PhishChecker;

    load(): void {
        browser.runtime.onMessage.addListener(this.onMessage);
        console.log("EmailParser module loaded");
    }

    unload(): void {
        browser.runtime.onMessage.removeListener(this.onMessage);
        console.log("EmailParser module unloaded");
    }

    // Use arrow function to maintain 'this' context
    private onMessage = (message: any, sender: any, sendResponse: any) => {
        if (message.id === BgMessageId.ReadDOM) {
            console.log("Content script received ReadDOM message");
            
            // Parse email data from the current page
            const emailData = this.parseEmailData();
            
            // Send response with DOMIsRead message ID back to the extension
            browser.runtime.sendMessage({
                id: UiMessageId.DOMIsRead,
                data: emailData
            }).catch(error => {
                console.error("Error sending DOMIsRead message:", error);
            });
            
            // Let Chrome know we're handling it
            sendResponse({ received: true });
            return true;
        }
    }
    
    private parseEmailData() {
        // Detect if we're on Gmail or Outlook
        const isGmail = window.location.hostname.includes('mail.google.com');
        const isOutlook = window.location.hostname.includes('outlook.office.com');
        
        if (isGmail) {
            return this.parseGmailEmail();
        } else if (isOutlook) {
            return this.parseOutlookEmail();
        } else {
            return {
                sender: "Unknown email service",
                subject: "Could not detect email service",
                body: "This page doesn't appear to be Gmail or Outlook"
            };
        }
    }
    
    private parseGmailEmail() {
        try {
            // Basic Gmail selectors - you may need to adjust these
            const sender = document.querySelector('.gD')?.getAttribute('email') || 'Unknown sender';
            const subject = document.querySelector('.hP')?.textContent || 'No subject';
            const body = document.querySelector('.a3s.aiL')?.innerHTML || 'No body content found';
            
            return { sender, subject, body };
        } catch (error) {
            console.error("Error parsing Gmail:", error);
            return { sender: "Error", subject: "Error", body: "Failed to parse Gmail content" };
        }
    }
    
    private parseOutlookEmail() {
        try {
            // Basic Outlook selectors - you may need to adjust these
            const sender = document.querySelector('._1yIHkYLrqDZpAMQ6uMi8Ix')?.textContent || 'Unknown sender';
            const subject = document.querySelector('._2LhyGc5yl3hbzUyNGQi-9s')?.textContent || 'No subject';
            const body = document.querySelector('._4utP_vaqQ3UQZH0GEBVQe')?.innerHTML || 'No body content found';
            
            return { sender, subject, body };
        } catch (error) {
            console.error("Error parsing Outlook:", error);
            return { sender: "Error", subject: "Error", body: "Failed to parse Outlook content" };
        }
    }
}