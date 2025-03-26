import {ModuleMessage, ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {Module, ModuleId} from "../../types/module.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {showNotification} from "@/utils/notifications.ts";

export class FileChecker extends Module {
    readonly id = ModuleId.FileChecker;
    private activePolling: Map<number, boolean> = new Map();
    private API_KEY = String(useAppConfig().fileCheckerApiKey);

    load(): void {
        chrome.downloads.onCreated.addListener(this.onDownloadCreated);
        chrome.downloads.onCreated.addListener((downloadItem) => {
            console.log("Download pause command sent for ID:", downloadItem);
            chrome.downloads.pause(downloadItem.id);
        });

        chrome.downloads.onChanged.addListener(this.onDownloadChanged);
        chrome.downloads.onChanged.addListener((downloadItem) => {
            console.log("Download info changed:", downloadItem);
        });
    }

    unload(): void {
        chrome.downloads.onCreated.removeListener(this.onDownloadCreated);
        chrome.downloads.onChanged.removeListener(this.onDownloadChanged);
    }

    private onDownloadChanged = (downloadDelta: chrome.downloads.DownloadDelta) => {
        console.log("Download info changed:", downloadDelta);
        
        if (downloadDelta.error?.current === 'FILE_VIRUS_INFECTED') {
            console.log(`Chrome detected virus in download ID: ${downloadDelta.id}`);
            
            if (this.activePolling.has(downloadDelta.id)) {
                this.activePolling.set(downloadDelta.id, false);
                console.log(`Stopped polling for download ID: ${downloadDelta.id}`);
            }
            
            chrome.downloads.cancel(downloadDelta.id);
        }
    }

    private onDownloadCreated = async (downloadItem: chrome.downloads.DownloadItem) => {
        chrome.downloads.pause(downloadItem.id);
        console.log("Download pause command sent for ID:", downloadItem.id);
        if (downloadItem.id !== undefined) {
            try {
                this.activePolling.set(downloadItem.id, true);
            } 
            catch (e) {
                console.error("Error managing download:", e);
            }
        }

        // cia uzkomentuota, kad nesvaistytu API limitu

        /*
        try {
            const results = await this.checkUrlWithSandbox(downloadItem.url, downloadItem.id);

            if (!this.activePolling.get(downloadItem.id)) {
                console.log(`Polling was already stopped for download ID: ${downloadItem.id}`);
                return;
            }
            
            if (results) {
                const data = results.final_verdict;
                console.log(data.verdict);
                console.log(data.threatLevel);
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
            if (this.activePolling.get(downloadItem.id)) {
                chrome.downloads.resume(downloadItem.id);
            }
        }
        finally {
            this.activePolling.delete(downloadItem.id);
        }
            */
    }

    private async checkUrlWithSandbox(url: string, downloadId: number): Promise<any> {
        console.log("Checking URL with sandbox:", url);
        try {
            const URL_ENDPOINT = "https://api.metadefender.com/v4/sandbox";

            const response = await fetch(URL_ENDPOINT, {
                method: "POST",
                headers: {
                    "apikey": this.API_KEY,
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
            
            return await this.pollForUrlResults(dataId, downloadId);
        } 
        catch (error) {
            console.error("Error checking file URL safety:", error);
            throw error;
        }
    }

    private async pollForUrlResults(dataId: string, downloadId: number): Promise<any> {
        console.log("Polling for URL results...");
        let attempts = 0;
        const maxAttempts = 12;

        const URL_ENDPOINT = "https://api.metadefender.com/v4/sandbox";
        
        const URL_RESULT_ENDPOINT = URL_ENDPOINT + '/' + dataId;
        
        while (attempts < maxAttempts && this.activePolling.get(downloadId)) {
            console.log("Polling attempt nr.: ", attempts);
            try {
                const response = await fetch(URL_RESULT_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'apikey': this.API_KEY
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

            if (!this.activePolling.get(downloadId)) {
                console.log(`Polling stopped for download ID: ${downloadId}`);
                break;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000)); 
        }

        if (!this.activePolling.get(downloadId)) {
            return;
        }
        
        throw new Error("URL check timed out. Please try again later.");
    }

    private async pollForResults(url: string): Promise<any> {
        // 12 bandymu po 5 sekundes => 1 minute gauti skenavimo rezultatui
        let attempts = 0;
        const maxAttempts = 12;

        const checkResult = async () => {
            try {
                // tikrina failo skenavimo rezultatus pagal anksciau gauta failo id
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'apikey': this.API_KEY,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    // progress_percantage yra API dokumentacijoj, bet nezinau kaip patikrinti/istestuoti ar grazina kazka kito nei 0 arba 100
                    if (data.scan_results?.progress_percentage === 100 || data.final_verdict) {

                        return data;
                    }
                }

                return null;
            } catch (error) {
                return null;
            }
        };

        // Periodiskai siuncia uzklausa patikrinti ar gautas skenavimo rezultatas
        while (attempts < maxAttempts) {
            const isComplete = await checkResult();
            if (isComplete) return isComplete;

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000)); // kas 5 sekundes poll'ina
        }

        return null;
    }

    private async pollFileScan(url: string){
        const results = await this.pollForResults(url);

        if (!results){
            console.log("Polling failed");
            return;
        }

        this.sendToRuntime({id: UiMessageId.ScanFinished});

        showNotification("File Checker", 'Scan finished. Check "Previous Scan" in the extension.')

        // FIXME: opening popup doesn't work because "the browser is unfocused". Not sure if fixable.
        // const notifListener = (notificationId: string) => {
        //     if (notifId !== notificationId){
        //         return;
        //     }
        //     waitForPopup(() => {
        //         browser.runtime.sendMessage({id: UiMessageId.NavigateTo, data: "/file-checker"});
        //     });
        //
        //     browser.notifications.onClicked.removeListener(notifListener);
        // }
        //
        // browser.notifications.onClicked.addListener(notifListener);
    }

    handleMessage(message: ModuleMessage): any {
        super.handleMessage(message);

        switch (message.id){
            case ModuleMessageId.PollFileScan: {
                const { url } = message.data;
                this.pollFileScan(url);
                break;
            }
        }
    }
}