import {ModuleMessage, ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {Module, ModuleId} from "../../types/module.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {showNotification} from "@/utils/notifications.ts";

export class UrlChecker extends Module {
    readonly id = ModuleId.UrlChecker;
    private VIRUSTOTAL_API_KEY = String(useAppConfig().safeBrowsingApiKey);
    private URLSCAN_API_KEY = String(useAppConfig().urlscanioApiKey);
    private virusTotalInProgress = false;
    private urlScanInProgress = false;

    load(): void {
    }

    unload(): void {
    }

    private async pollURLScanResult (uuid: string, resultUrl: string) {
        let attempts = 0;
        const maxAttempts = 15;  // Increased from 10 to 15
        const initialDelay = 8000;  // Increased initial delay to 8 seconds

        // Return initial message that scan is in progress
        //setDebug(`URLScan.io scan submitted. UUID: ${uuid}. Waiting for results...`);

        while (attempts < maxAttempts) {
            try {
                // GET scan results
                const resultResponse = await fetch(resultUrl, {
                    method: "GET",
                    headers: {
                        "API-Key": this.URLSCAN_API_KEY,
                    }
                });

                if (resultResponse.ok) {
                    const resultData = await resultResponse.json();

                    // Check scan status
                    if (resultData.task && resultData.task.status === "complete") {
                        //setDebug(`Scan complete after ${attempts + 1} attempts`);
                        return resultData;
                    }

                    // Provide status updates in debug
                    //setDebug(`Attempt ${attempts + 1}/${maxAttempts}: Scan status: ${resultData.task?.status || "unknown"}`);
                }
            } catch (error) {
                console.error("URLScan.io result retrieving error:", error);
                //setDebug(`Error checking scan status: ${error}`);
            }

            attempts++;
            // Use exponential backoff for waiting (start with longer delay, then increase)
            const delay = initialDelay + (attempts * 2000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // If we timeout, check one more time with an alternative method
        try {
            const directResultUrl = `https://urlscan.io/api/v1/result/${uuid}/`;
            const finalAttempt = await fetch(directResultUrl, {
                headers: {
                    "API-Key": this.URLSCAN_API_KEY
                }
            });

            if (finalAttempt.ok) {
                const resultData = await finalAttempt.json();
                if (resultData.task && resultData.task.status === "complete") {
                    //setDebug("Found results on final attempt");
                    return resultData;
                }
            }
        } catch (error) {
            console.error("Final attempt error:", error);
        }

        return null;
    };

    private async pollVirusTotalResults(url: string)  {
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            try {
                // GET analysis
                const resultResponse = await fetch(url, {
                    method: "GET",
                    headers: {
                        "x-apikey": this.VIRUSTOTAL_API_KEY
                    }
                });

                if (resultResponse.ok) {
                    return await resultResponse.json();
                }
            } catch (error) {
                console.error("VirusTotal result retrieving error:", error);
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 6000));
        }

        return null;
    };

    private async pollVirusTotal(url: string){
        this.virusTotalInProgress = true;
        const results = await this.pollVirusTotalResults(url);
        this.virusTotalInProgress = false;

        if (!results){
            console.log("Virustotal Polling failed");
            return;
        }

        this.sendToRuntime({id: UiMessageId.VirusTotalScanFinished, data: results});
        this.showFinishedNotification();
    }

    private async pollUrlScan(uuid: string, url: string){
        this.urlScanInProgress = true;
        const results = await this.pollURLScanResult(uuid, url);
        this.virusTotalInProgress = false;

        if (!results){
            console.log("URL Scan Polling failed");
            return;
        }

        this.sendToRuntime({id: UiMessageId.UrlScanFinished, data: results});
        this.showFinishedNotification();
    }

    private showFinishedNotification(){
        if (!this.urlScanInProgress && !this.virusTotalInProgress) {
            showNotification("Url Checker", 'Scan finished. Check "Previous Scan" in the extension.')
        }
    }

    handleMessage(message: ModuleMessage): any {
        super.handleMessage(message);

        switch (message.id){
            case ModuleMessageId.PollVirusTotalScan: {
                const { url } = message.data;
                this.pollVirusTotal(url);
                break;
            }
            case ModuleMessageId.PollUrlScan: {
                const { uuid, url } = message.data;
                this.pollUrlScan(uuid, url);
                break;
            }
        }
    }
}