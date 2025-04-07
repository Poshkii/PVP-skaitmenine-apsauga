import {FileChecker} from "@/entrypoints/content/modules/file-checker/file-checker.ts";
import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";
import {Configuration} from "@/utils/config.ts";

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

    browser.runtime.onMessage.addListener(async (
        message: BgMessage,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void ) => {
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
                const { moduleId, enabled } = message.data;

                if (enabled) {
                    moduleManager.loadModule(moduleId);
                } else {
                    moduleManager.unloadModule(moduleId);
                }
                break;
            }
            case BgMessageId.SendModuleMessage: {
                const { moduleId, moduleMessage } = message.data;
                moduleManager.sendMessage(moduleId, moduleMessage);
                break;
            }
            case BgMessageId.GetCookies: {
                try {
                    // Get cookies from the active tab
                    const cookies = await getAllCookies();
                    // Send cookies back to the frontend
                    browser.runtime.sendMessage({ id: UiMessageId.CookiesRetrieved, data: cookies });
                    console.log("Cookies sent:", cookies);
                } catch (error) {
                    console.error("Failed to retrieve cookies:", error);
                    // Type-cast error to any to access message directly
                    browser.runtime.sendMessage({ id: UiMessageId.CookiesError, data: { message: (error as any).message } });
                }
                break;
            }
            case BgMessageId.StoreEmailData: {
                console.log("Received StoreEmailData message:", message);
                // Then continue with the existing code...
                const { email, breachData } = message.data;
                breachInfo[email] = breachData;
                console.log(`Stored breach data for email: ${email}`);
                console.log(`Stored data: ${breachData}`);
                break;
            }
            case BgMessageId.GetEmailData: {
                const { email } = message.data;
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
        }
    });
});

async function getCookiesForCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (!tabs.length || !tabs[0].url) {                
                return reject("No active tab found.");
            }

            console.log("Tab url: ", tabs[0].url)
            const url = new URL(tabs[0].url);
            const domain = url.hostname;

            if (chrome.cookies) {
                const cookies = await chrome.cookies.getAll({ domain: domain });
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

async function scanTrackingCookies(): Promise<chrome.cookies.Cookie[]> {
    try {
        // Explicitly type the returned value
        const cookies = await getAllCookies() as chrome.cookies.Cookie[];

        const trackerDomains = [
            'doubleclick.net', 'google-analytics.com', 'ads.google.com',
            'facebook.com', 'adservice.google.com', 'twitter.com',
            'bing.com', 'amazon-adsystem.com'
        ];

        const trackingCookies = cookies.filter((cookie) =>
            trackerDomains.some(domain => cookie.domain.includes(domain))
        );

        console.log("Tracking cookies found:", trackingCookies);
        return trackingCookies;
    } catch (error) {
        console.error("Error retrieving cookies:", error);
        return [];
    }
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