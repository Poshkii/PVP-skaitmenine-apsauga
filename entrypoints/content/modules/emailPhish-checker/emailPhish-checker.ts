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
        const isProton = window.location.hostname.includes('mail.proton.me');
        
        if (isGmail) {
            return this.parseGmailEmail();
        } else if (isOutlook) {
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
    private parseProtonEmail() {
        try {
            console.log("Parsing ProtonMail email");
            
            // 1. Sender - Using data-testid attributes
            let sender = '';
            const senderSelectors = [
                '[data-testid="message-header:from-value"]',
                '[data-testid="message-header:sender-address"]',
                '[data-testid="message-header:sender"]',
                '[data-testid="message-header:from"]',
                // Fallbacks
                '.message-header-sender-address',
                '.message-sender-address'
            ];
            
            for (const selector of senderSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent) {
                    sender = element.textContent.trim();
                    console.log(`Found sender using selector ${selector}:`, sender);
                    break;
                }
            }
            
            // 2. Subject - Using the data-testid you found
            let subject = '';
            const subjectSelectors = [
                '[data-testid="conversation-header:subject"]',
                '[data-testid="message-header:subject"]',
                '[data-testid="subject"]',
                // Fallbacks
                'h1.message-conversation-summary-header',
                '.message-subject'
            ];
            
            for (const selector of subjectSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent) {
                    subject = element.textContent.trim();
                    console.log(`Found subject using selector ${selector}:`, subject);
                    break;
                }
            }
            
            // 3. Body - Using data-testid attributes
            let body = '';
            const bodySelectors = [
                '[data-testid="message-content:body"]',
                '[data-testid="message-content"]',
                '[data-testid="message:body"]',
                // Fallbacks
                '.message-content',
                'iframe.proton-message-content'
            ];
            
            for (const selector of bodySelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    // Handle iframe case
                    if (element.tagName === 'IFRAME') {
                        try {
                            const iframe = element as HTMLIFrameElement;
                            if (iframe.contentDocument && iframe.contentDocument.body) {
                                body = iframe.contentDocument.body.innerHTML;
                                console.log(`Found body in iframe using selector ${selector}`);
                                break;
                            }
                        } catch (e) {
                            console.warn("Could not access iframe content due to security restrictions");
                        }
                    } else {
                        body = element.innerHTML || element.textContent || '';
                        console.log(`Found body using selector ${selector}`);
                        break;
                    }
                }
            }
            
            // If we still don't have the body, try a more general approach
            if (!body) {
                // Try to find the main content container
                const contentContainer = document.querySelector('[data-testid="conversation"]') || 
                                        document.querySelector('[data-testid="message-container"]');
                
                if (contentContainer) {
                    // Find all div elements that might contain the message body
                    const contentDivs = contentContainer.querySelectorAll('div');
                    let largestDiv = null;
                    let maxLength = 0;
                    
                    for (const div of contentDivs) {
                        // Skip if this contains the sender or subject
                        if (div.textContent && 
                            div.textContent.length > maxLength && 
                            !div.textContent.includes(sender) && 
                            !div.textContent.includes(subject)) {
                            largestDiv = div;
                            maxLength = div.textContent.length;
                        }
                    }
                    
                    if (largestDiv) {
                        body = largestDiv.innerHTML || largestDiv.textContent || '';
                        console.log("Found body using largest div approach");
                    }
                }
            }
            
            // 4. Debug information
            console.log("ProtonMail parsing results:", { 
                sender, 
                subject, 
                body: body.substring(0, 100) + "..." 
            });
            
            return { 
                sender: sender || 'Unknown sender', 
                subject: subject || 'No subject', 
                body: body || 'No body content found' 
            };
        } catch (error) {
            console.error("Error parsing ProtonMail:", error);
            return { sender: "Error", subject: "Error", body: "Failed to parse ProtonMail content" };
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