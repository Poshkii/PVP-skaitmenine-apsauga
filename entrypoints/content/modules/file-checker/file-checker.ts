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
    }

    unload(): void {
        chrome.downloads.onCreated.removeListener(this.onDownloadCreated);
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
            const results = await this.checkUrlWithSandbox(downloadItem.url);
            
            if (results) {
                const data = results.final_verdict;
                if (data.threatLevel > 0 && data.verdict === "MALICIOUS"){
                    console.log("File is unsafe, canceling download");
                    chrome.downloads.cancel(downloadItem.id);
                }
                else {
                    console.log("File is safe, resuming download");
                    chrome.downloads.resume(downloadItem.id);
                }

            }
        } 
        catch (error) {
            console.error("Error checking file safety:", error);
            chrome.downloads.resume(downloadItem.id);
        }
    }

    private async checkUrlWithSandbox(url: string): Promise<any> {
        console.log("Checking URL with sandbox:", url);
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
                const errorData = await response.json();
                throw new Error(errorData.error?.messages || 'Failed to submit URL for scanning');
            }
            
            const submitData = await response.json();
            const dataId = submitData.sandbox_id;
            
            return await this.pollForUrlResults(dataId);
        } 
        catch (error) {
            console.error("Error checking file URL safety:", error);
            throw error;
        }
    }

    private async pollForUrlResults(dataId: string): Promise<any> {
        console.log("Polling for URL results...");
        let attempts = 0;
        const maxAttempts = 12;

        const URL_ENDPOINT = "https://api.metadefender.com/v4/sandbox";
        const API_KEY = String(useAppConfig().fileCheckerApiKey);
        
        const URL_RESULT_ENDPOINT = URL_ENDPOINT + '/' + dataId;
        
        while (attempts < maxAttempts) {
            console.log("Polling attempt nr.: ", attempts);
            try {
                const response = await fetch(URL_RESULT_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'apikey': API_KEY
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.final_verdict) {
                        console.log("URL check completed.");
                        return data;
                    }
                }
            } 
            catch (error) {
                console.error("Error polling for URL results:", error);
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000)); 
        }
        
        throw new Error("URL check timed out. Please try again later.");
    }
}