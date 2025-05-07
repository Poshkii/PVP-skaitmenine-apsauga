import {FileChecker} from "@/entrypoints/content/modules/file-checker/file-checker.ts";
import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";
import {Configuration} from "@/utils/config.ts";
import {PhishChecker} from "@/entrypoints/content/modules/emailPhish-checker/emailPhish-checker.ts";
import {DeletionProvider} from "@/entrypoints/background/deletion-provider.ts";
import {TrackerManager} from "@/entrypoints/content/modules/tracker-manager/tracker-manager.ts";
import {ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";

interface BreachInfo {
    [email: string]: any;  // Stores breach data by email
}

const breachInfo: BreachInfo = {};  // Object to store breach data

export default defineBackground(async () => {
    console.log("Background script initialized.");
    const config = new Configuration();
    await config.load();

    const fileChecker = new FileChecker();
    const moduleManager = new ModuleManager();
    moduleManager.registerModule(fileChecker, config.isModuleEnabled(fileChecker.id));

    const phishChecker = new PhishChecker();
    moduleManager.registerModule(phishChecker, config.isModuleEnabled(phishChecker.id));

    const deletionProvider = new DeletionProvider();
    const trackerManager = new TrackerManager();
    moduleManager.registerModule(trackerManager, config.isModuleEnabled(trackerManager.id));

    browser.webRequest.onBeforeRequest.addListener(
        (details) => {
            // Check if this is an Outlook EML download
            if (details.url.includes(".eml") && 
                (details.url.includes("outlook.office") || 
                 details.url.includes("outlook.live"))) {
                
                console.log("Intercepted EML download:", details.url);
                
                // Use a non-async approach to fetch the EML content
                fetch(details.url)
                    .then(response => response.text())
                    .then(emlData => {
                        // Send the EML data to the content script
                        browser.tabs.query({active: true, currentWindow: true})
                            .then(tabs => {
                                if (tabs.length > 0) {
                                    moduleManager.sendMessage(ModuleId.PhishChecker, {
                                        id: ModuleMessageId.ProcessEmlData,
                                        data: { emlData }
                                    });
                                }
                            });
                    })
                    .catch(error => {
                        console.error("Error fetching EML data:", error);
                    });
            }
            
            // We're not canceling the request, so return { cancel: false }
            return { cancel: false };
        },
        {urls: ["*://*.outlook.office.com/*", "*://*.outlook.office365.com/*", "*://*.outlook.live.com/*"]},
        ["blocking"]
    );

    browser.webRequest.onCompleted.addListener(
        (details) => {
            if (details.url.includes(".eml") && 
                (details.url.includes("outlook.office") || 
                 details.url.includes("outlook.live"))) {
                
                console.log("Completed EML download:", details.url);
                
                fetch(details.url)
                    .then(response => response.text())
                    .then(emlData => {
                        browser.tabs.query({active: true, currentWindow: true})
                            .then(tabs => {
                                if (tabs.length > 0) {
                                    moduleManager.sendMessage(ModuleId.PhishChecker, {
                                        id: ModuleMessageId.ProcessEmlData,
                                        data: { emlData }
                                    });
                                }
                            });
                    })
                    .catch(error => {
                        console.error("Error fetching EML data:", error);
                    });
            }
        },
        {urls: ["*://*.outlook.office.com/*", "*://*.outlook.office365.com/*", "*://*.outlook.live.com/*"]}
    );

    browser.runtime.onMessage.addListener(async (
        message: BgMessage,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void) => {
        switch (message.id) {
            case BgMessageId.OpenPopup: {
                browser.action.openPopup()
                break;
            }
            case BgMessageId.NavigateTo: {
                waitForPopup(() => {
                    browser.runtime.sendMessage({id: UiMessageId.NavigateTo, data: message.data.route});
                });
                break;
            }
            case BgMessageId.ModuleChange: {
                const {moduleId, enabled} = message.data;

                if (enabled) {
                    moduleManager.loadModule(moduleId);
                } else {
                    moduleManager.unloadModule(moduleId);
                }
                break;
            }
            case BgMessageId.SendModuleMessage: {
                const {moduleId, moduleMessage} = message.data;
                moduleManager.sendMessage(moduleId, moduleMessage);
                break;
            }
            case BgMessageId.GetCookies: {
                try {
                    // Get cookies from the active tab
                    const cookies = await getAllCookies();
                    // Send cookies back to the frontend
                    browser.runtime.sendMessage({id: UiMessageId.CookiesRetrieved, data: cookies});
                    console.log("Cookies sent:", cookies);
                } catch (error) {
                    console.error("Failed to retrieve cookies:", error);
                    // Type-cast error to any to access message directly
                    browser.runtime.sendMessage({
                        id: UiMessageId.CookiesError,
                        data: {message: (error as any).message}
                    });
                }
                break;
            }
            case BgMessageId.StoreEmailData: {
                console.log("Received StoreEmailData message:", message);
                // Then continue with the existing code...
                const {email, breachData} = message.data;
                breachInfo[email] = breachData;
                console.log(`Stored breach data for email: ${email}`);
                console.log(`Stored data: ${breachData}`);
                break;
            }
            case BgMessageId.GetEmailData: {
                const {email} = message.data;
                // Retrieve breach data for the email
                const data = breachInfo[email] || null;
                sendResponse(data);
                console.log(`Retrieved breach data for email: ${email}`);
                console.log(`Data: ${data}`);
                break; // Note: break is not needed after return
            }
            case BgMessageId.ScanEmail: {
                const openPopupAndScan = async () => {
                    try {
                        waitForPopup(() => {
                            browser.runtime.sendMessage({id: UiMessageId.NavigateTo, data: message.data.route});
                        });

                        const waitForPopupReady = new Promise<void>((resolve) => {
                            const listener = (message: any) => {
                                if (message.id === UiMessageId.PopupReady) {
                                    console.log("Popup is ready");
                                    browser.runtime.onMessage.removeListener(listener);
                                    resolve();
                                }
                            };
                            browser.runtime.onMessage.addListener(listener);
                        });

                        await waitForPopupReady;

                        browser.runtime.sendMessage({
                            id: UiMessageId.ScanEmail,
                            data: message.data.email
                        });

                    } catch (error) {
                        console.error("Error opening popup:", error);
                    }
                };

                openPopupAndScan();
                break;
            }
            case BgMessageId.DeletionUrl: {
                const {domain} = message.data;
                const details = deletionProvider.getDeletionDetails(domain);
                sendResponse(details);
                break;
            }
            case BgMessageId.DownloadOutlookEml: {
                const { messageId } = message.data;
                const tabs = await browser.tabs.query({active: true, currentWindow: true});
                
                if (tabs.length > 0 && tabs[0].id) {
                    // Execute a content script to trigger the download
                    await browser.tabs.executeScript(tabs[0].id, {
                        code: `
                            (function() {
                                // Find and click the "More actions" button
                                const moreActionsButton = document.querySelector('[aria-label="More actions"] button, [aria-label="More commands"] button');
                                if (moreActionsButton) {
                                    moreActionsButton.click();
                                    
                                    // Wait for the menu to appear
                                    setTimeout(() => {
                                        // Look for "Download" or "Download message" option in the menu
                                        const downloadOptions = Array.from(document.querySelectorAll('button, [role="menuitem"]'));
                                        const downloadOption = downloadOptions.find(el => 
                                            el.textContent?.includes('Download') || 
                                            el.getAttribute('aria-label')?.includes('Download')
                                        );
                                        
                                        if (downloadOption) {
                                            downloadOption.click();
                                        } else {
                                            console.error("Download option not found");
                                        }
                                    }, 500);
                                } else {
                                    console.error("More actions button not found");
                                }
                            })();
                        `
                    });
                }
                break;
            }
        }
    });
});

async function getCookiesForCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            if (!tabs.length || !tabs[0].url) {
                return reject("No active tab found.");
            }

            console.log("Tab url: ", tabs[0].url)
            const url = new URL(tabs[0].url);
            const domain = url.hostname;

            if (chrome.cookies) {
                const cookies = await chrome.cookies.getAll({domain: domain});
                console.log("Cookies found")
                resolve(cookies);
            } else {
                reject("browser.cookies is undefined.");
            }
        });
    });
}

async function getAllCookies() {
    return new Promise((resolve, reject) => {
        chrome.cookies.getAll({}, (cookies) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(cookies);
            }
        });
    });
}

export function waitForPopup(callback: () => void) {
    const onMessage = (message: BgMessage) => {
        switch (message.id) {
            case BgMessageId.PopupOpened: {
                browser.runtime.onMessage.removeListener(onMessage);
                callback();
            }
        }
    }

    browser.runtime.onMessage.addListener(onMessage);

    browser.action.openPopup();
}