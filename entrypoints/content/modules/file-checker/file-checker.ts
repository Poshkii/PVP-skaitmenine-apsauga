console.log("FileChecker script loaded in service worker");


import {Module, ModuleId} from "../../types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";

export class FileChecker extends Module {
    readonly id = ModuleId.FileChecker;

    load(): void {
        chrome.downloads.onCreated.addListener(this.onDownloadCreated);

        chrome.downloads.onCreated.addListener((downloadItem) => {
            console.log("Download detected:", downloadItem);
        });

        document.addEventListener("focusin", this.onFocusIn);
        document.addEventListener("focusout", this.onFocusOut);
    }

    unload(): void {
        chrome.downloads.onCreated.removeListener(this.onDownloadCreated);

        document.removeEventListener("focusin", this.onFocusIn);
        document.removeEventListener("focusout", this.onFocusOut);
    }

    private onDownloadCreated = async (downloadItem: chrome.downloads.DownloadItem) => {
        
        if (downloadItem.id !== undefined) {
            try {
                chrome.downloads.pause(downloadItem.id);
                console.log("Download pause command sent for ID:", downloadItem.id);
            } catch (e) {
                console.error("Error pausing download:", e);
            }
        }

        try {
            const isSafe = await this.checkFileSafety(downloadItem.url);

            if (isSafe) {
                console.log("File is safe, resuming download");
                //chrome.downloads.resume(downloadItem.id);
            } 
            else {
                chrome.downloads.cancel(downloadItem.id);
            }

            this.showWarning(downloadItem.filename);
        } 
        catch (error) {
            console.error("Error checking file safety:", error);
            chrome.downloads.resume(downloadItem.id);
        }
    }

    private async checkFileSafety(url: string): Promise<boolean> {
        try {
            const URL_ENDPOINT = "https://api.metadefender.com/v4/sandbox";
            const API_KEY = String(useAppConfig().fileCheckerApiKey);

            const response = await fetch(URL_ENDPOINT, {
                method: "POST",
                headers: {
                    "apikey": API_KEY,
                    "Content-Type": "application/json"  
                },
                body: JSON.stringify({ url: url }) 
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            return data.final_verdict?.verdict !== "MALICIOUS";
        }
        catch (error) {
            console.error("Error checking file URL safety:", error);
            throw error;
        }
    }

    private showWarning(fileName: string) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/warning-icon.png',
            title: 'Unsafe File Blocked',
            message: `The file "${fileName}" was blocked because it was found to be malicious.`,
            priority: 2
        })
    }

    private onFocusIn = (event: FocusEvent) => {
        
    }

    private onFocusOut = (event: FocusEvent) => {
        
    }
}