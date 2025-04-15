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
        const isOutlook = window.location.hostname.includes('outlook.office365.com');
        
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

    handleMessage(message: ModuleMessage): any {
        super.handleMessage(message);

        switch (message.id){
            case ModuleMessageId.ReadDom: {
                this.readDom();
            }
        }
    }
}