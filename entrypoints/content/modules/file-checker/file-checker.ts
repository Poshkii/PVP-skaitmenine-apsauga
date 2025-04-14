import {ModuleMessage, ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {Module, ModuleId} from "../../types/module.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {showNotification} from "@/utils/notifications.ts";
import DownloadDelta = chrome.downloads.DownloadDelta;

export class FileChecker extends Module {
    readonly id = ModuleId.FileChecker;
    private API_URL = String(useAppConfig().metaDefenderApiUrl);
    private HASH_ENDPOINT = "/hash";
    private FILE_ENDPOINT = "/file";

    load(): void {
        chrome.downloads.onChanged.addListener(this.onDownloadChanged);
    }

    unload(): void {
        chrome.downloads.onChanged.removeListener(this.onDownloadChanged);
    }

    private onDownloadChanged = async (downloadDelta: DownloadDelta) => {
        if (downloadDelta.state && downloadDelta.state.current === 'complete') {
            chrome.downloads.search({
                id: downloadDelta.id
            }, async (downloads) => {
                if (downloads.length > 0) {
                    const download = downloads[0];
                    await this.onDownloadFinished(download);
                }
            });
        }
    }


    private onDownloadFinished = async (downloadItem: chrome.downloads.DownloadItem) => {
        if (!downloadItem.finalUrl || !downloadItem.filename) {
            console.error("Invalid download item");
            return;
        }

        try {
            // Convert file URL to a File object
            const response = await fetch(downloadItem.finalUrl);
            const blob = await response.blob();
            const file = new File([blob], downloadItem.filename, { type: blob.type });

            const hashCheckResult = await this.checkFileByHash(file);

            if (hashCheckResult) {
                await this.processScanResults(hashCheckResult);
            } else {
                await this.uploadAndScanFile(file);
            }
        } catch (error) {
            console.error("Error processing downloaded file:", error);
        }
    }

    private async checkFileByHash(file: File): Promise<any | null> {
        let sha256Hash: string;

        try {
            sha256Hash = await this.calculateSHA256(file);
        } catch (error) {
            console.error("Failed to calculate sha256:", error);
            return null;
        }

        if (sha256Hash) {
            try {
                const res = await fetch(`${this.API_URL}${this.HASH_ENDPOINT}/${sha256Hash}`, {
                    method: "GET",
                });
                if (res.ok) {
                    return await res.json();
                }
            } catch (error) {
                console.error("Error while checking SHA-256 hash:", error);
            }
        }

        return null;
    }
    
    private async calculateSHA256(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    if (!event.target?.result) {
                        throw new Error("Failed to read file");
                    }

                    const arrayBuffer = event.target.result as ArrayBuffer;
                    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray
                        .map(byte => byte.toString(16).padStart(2, '0'))
                        .join('');

                    resolve(hashHex);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error("Error reading file"));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    private async uploadAndScanFile(file: File) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch(this.API_URL + this.FILE_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                const pollUrl = this.API_URL + this.FILE_ENDPOINT + '/' + uploadData.data_id;
                await this.pollFileScan(pollUrl);
            } else {
                const errorData = await uploadResponse.json();
                console.error(`File upload error: ${errorData.error?.messages || 'Failed to check file'}`);
            }
        } catch (error) {
            console.error("Error uploading and scanning file:", error);
        }
    }

    private async processScanResults(data: any) {
        const scanResults = data.scan_results;
        
        if (scanResults) {
            //Report update
            try {
                // Get the filename from the data or use a default
                let filename = data.file_info?.display_name || "Unknown file";
                filename = filename.split(/[/\\]/).pop() || filename;
                
                // Determine safety status
                const detectedCount = scanResults.total_detected_avs || 0;
                const safety = detectedCount > 0 ? "unsafe" : "safe";

                const scannedFiles = await chrome.storage.local.get(["scannedFiles"]);
                const filesArray = scannedFiles.scannedFiles || [];

                filesArray.push({
                    name: filename,
                    safety: safety,
                    timestamp: Date.now()
                });

                await chrome.storage.local.set({
                    "scannedFiles": filesArray
                });
            } catch (error) {
                console.error("Error updating file scan report:", error);
            }

            const detectedCount = scanResults.total_detected_avs || 0;
            const totalEngines = scanResults.total_avs || 1;

            const resultMessage = detectedCount > 0
                ? `Threats detected: ${detectedCount} out of ${totalEngines} security engines.`
                : `Checked with ${totalEngines} security engines. No threats found.`;

            const notificationTitle = detectedCount > 0 ? "Potential Security Threat" : "File Safe";
            
            await chrome.storage.local.set({
                "previousFileScanUrl": `${this.API_URL}${this.FILE_ENDPOINT}/${data.data_id || ''}`,
                "lastScanResults": data
            });

            this.sendToRuntime({id: UiMessageId.ScanFinished});
            showNotification(notificationTitle, resultMessage);
        }
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

        await this.processScanResults(results);

        //this.sendToRuntime({id: UiMessageId.ScanFinished});

        //showNotification("File Checker", 'Scan finished. Check "Previous Scan" in the extension.')

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