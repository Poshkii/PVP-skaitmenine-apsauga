import {FileChecker} from "@/entrypoints/content/modules/file-checker/file-checker.ts";
import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";
import {Configuration} from "@/utils/config.ts";
import {PhishChecker} from "@/entrypoints/content/modules/emailPhish-checker/emailPhish-checker.ts";
import {fetchEasyList, parseEasyList, categorizeRules, createRulesets } from "@/utils/easyListParse.ts";

const EASYLIST_URL = 'https://easylist.to/easylist/easylist.txt';
const EASYPRIVACY_URL = 'https://easylist.to/easylist/easyprivacy.txt';
const TRACKER_CATEGORIES = {
    analytics: "Analytics",
    advertising: "Advertising",
    social: "Social Media",
    other: "Other Trackers"
};

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
            case BgMessageId.UpdateTrackerRules: {
                try {
                    await fetchAndProcessEasyLists();
                    browser.runtime.sendMessage({ id: UiMessageId.UpdateTrackerRules});
                    console.log("Tracker ruleset updated");
                } catch (error) {
                    console.error("Failed to update ruleset:", error);
                    browser.runtime.sendMessage({ id: UiMessageId.TrackerRulesError, data: { message: (error as any).message } });
                }
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

browser.runtime.onInstalled.addListener(async () => {
    console.log("Initializing tracker setup");
    
    browser.storage.local.set({
        blockStats: {
            total: 0,
            analytics: 0,
            advertising: 0,
            social: 0,
            other: 0
        },
        settings: {
            blockAnalytics: true,
            blockAdvertising: true,
            blockSocial: true,
            blockOther: true,
            blockFingerprints: true,
            lastUpdated: null
        }
    });

    // Set up alarm for periodic updates
    browser.alarms.create('updateEasyList', { periodInMinutes: 60 * 24 }); // Once per day
});

browser.webNavigation.onCompleted.addListener((details) => {
    // Only process main frame navigations (not iframes)
    if (details.frameId === 0) {
        console.log(`Page loaded: ${details.url}`);
        checkTrackersOnPage(details.tabId, details.url);
    }
});

function checkTrackersOnPage(tabId: number, url: string) {
    // Give the page a moment to finish loading all resources
    setTimeout(() => {
        try {
        // Make sure we're using the correct API
        if (browser.declarativeNetRequest && chrome.declarativeNetRequest.getMatchedRules) {
            chrome.declarativeNetRequest.getMatchedRules(
                { tabId: tabId },
                (results) => {
                    if (browser.runtime.lastError) {
                        console.error("Error in getMatchedRules:", browser.runtime.lastError.message);
                        return;
                    }
                    
                    // Access the matched rules info safely
                    const matchedRules = results?.rulesMatchedInfo || [];
                    console.log(`Detected ${matchedRules.length} tracker matches on ${url}`);
                    
                    if (matchedRules.length > 0) {
                        updateStatsFromMatches(matchedRules);
                        updateBadge(tabId, matchedRules.length);
                    }
                }
            );
        } else {
            console.warn("declarativeNetRequest.getMatchedRules is not available");
        }
        } catch (error) {
            console.error("Exception checking for trackers:", error);
        }
    }, 1500);
}  

function updateStatsFromMatches(matchedRules: chrome.declarativeNetRequest.MatchedRuleInfo[]) {
    browser.storage.local.get(['blockStats', 'ruleCategories', 'ruleMetadata'], (data) => {
        if (browser.runtime.lastError) {
            console.error("Error retrieving stats from storage:", browser.runtime.lastError.message);
            return;
        }
    
        const stats = data.blockStats || {
            total: 0,
            analytics: 0,
            advertising: 0,
            social: 0,
            other: 0
        };
    
        const ruleCategories = data.ruleCategories || {};
        const ruleMetadata = data.ruleMetadata || {};
    
        let newMatches = 0;
    
        matchedRules.forEach(info => {
            const ruleId = info.rule.ruleId;
            const category = ruleCategories[ruleId] || 'other';
            const metadata = ruleMetadata[ruleId] || {};
    
            console.log(`[Tracker Match] Rule ID: ${ruleId}, Category: ${category}`);
            if (metadata.urlFilter) console.log(`  ↳ URL Filter: ${metadata.urlFilter}`);
            if (metadata.domains) console.log(`  ↳ Domains: ${metadata.domains.join(', ')}`);
            if (metadata.action) console.log(`  ↳ Action: ${metadata.action}`);
    
            stats[category] += 1;
            stats.total += 1;
            newMatches += 1;
        });
    
        if (newMatches > 0) {
            console.log(`Updated block stats with ${newMatches} new matches`);
            browser.storage.local.set({ blockStats: stats }, () => {
                if (browser.runtime.lastError) {
                    console.error("Error saving stats:", browser.runtime.lastError.message);
                }
            });
        }
    });
}
  
  // Update the extension badge to show number of trackers blocked
function updateBadge(tabId: number, count: number) {
    try {
        if (count > 0) {
            browser.action.setBadgeText({
                text: count.toString(),
                tabId: tabId
            });
            browser.action.setBadgeBackgroundColor({
                color: '#E53935', // Red color for badge
                tabId: tabId
            });
        } else {
            browser.action.setBadgeText({
                text: '',
                tabId: tabId
            });
        }
    } catch (error) {
        console.error("Error updating badge:", error);
    }
}

async function fetchAndProcessEasyLists() {
    console.log("Fetching EasyList rules");

    try {
        // Get user settings
        const data = await browser.storage.local.get('settings');
        const settings = data.settings || {
            blockAnalytics: true,
            blockAdvertising: true,
            blockSocial: true,
            blockOther: true,
            blockFingerprints: true
        };
        
        const enabled = {
            analytics: settings.blockAnalytics,
            advertising: settings.blockAdvertising,
            social: settings.blockSocial,
            other: settings.blockOther
        };
        
        // Fetch the lists
        const [easyListContent, easyPrivacyContent] = await Promise.all([
            fetchEasyList(EASYLIST_URL),
            fetchEasyList(EASYPRIVACY_URL)
        ]);
        
        // Parse lists into rules
        let nextId = 1;
        const [easyListRules, nextAfterEasy] = easyListContent
        ? parseEasyList(easyListContent, nextId)
        : [[], nextId];

        const [easyPrivacyRules, nextAfterPrivacy] = easyPrivacyContent
        ? parseEasyList(easyPrivacyContent, nextAfterEasy)
        : [[], nextAfterEasy];
        
        console.log(`Parsed ${easyListRules.length} EasyList rules and ${easyPrivacyRules.length} EasyPrivacy rules`);
        
        // Categorize and prepare rules
        const categorizedEasyList = categorizeRules(easyListRules);
        const categorizedEasyPrivacy = categorizeRules(easyPrivacyRules);
        
        // Combine categories from both lists
        const combinedCategories = {
            analytics: [...categorizedEasyList.analytics, ...categorizedEasyPrivacy.analytics],
            advertising: [...categorizedEasyList.advertising, ...categorizedEasyPrivacy.advertising],
            social: [...categorizedEasyList.social, ...categorizedEasyPrivacy.social],
            other: [...categorizedEasyList.other, ...categorizedEasyPrivacy.other]
        };
        
        // Create rulesets based on enabled categories
        const rulesets = createRulesets(combinedCategories, enabled);
        
        // Apply rules
        await applyRules(rulesets);
        
        // Update last updated timestamp
        const newSettings = { ...settings, lastUpdated: new Date().toISOString() };
        browser.storage.local.set({ settings: newSettings });
        
        console.log("EasyList rules updated successfully");
    } catch (error) {
        console.error("Error processing EasyList rules:", error);
    }
}

async function applyRules(rulesets: Record<string, chrome.declarativeNetRequest.Rule[]>): Promise<void> {
    try {
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const existingRuleIds = existingRules.map(rule => rule.id);

        if (existingRuleIds.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: existingRuleIds,
            });
        }

        let allRules: chrome.declarativeNetRequest.Rule[] = [];
        let ruleCategories: Record<number, string> = {};
        
        // Store which rule belongs to which category
        Object.entries(rulesets).forEach(([category, rules]) => {
            rules.forEach(rule => {
                const originalId = rule.id;
                ruleCategories[originalId] = category;
                allRules.push({ ...rule }); 
            });
        });

        let ruleCounter = await getRuleCounter();
        let finalRuleCategories: Record<number, string> = {};
        let finalRuleMetadata: Record<number, { urlFilter?: string, domains?: string[], action?: string }> = {};
        
        allRules = allRules.map((rule) => {
            const originalId = rule.id;
            const newId = ruleCounter++;
        
            finalRuleCategories[newId] = ruleCategories[originalId] || 'other';
            finalRuleMetadata[newId] = {
                urlFilter: rule.condition?.urlFilter,
                domains: rule.condition?.domains,
                action: rule.action?.type
            };
        
            rule.id = newId;
            return rule;
        });
        
        await setRuleCounter(ruleCounter);

        if (allRules.length > 30000) {
            console.warn(`Rule count (${allRules.length}) exceeds Chrome limit of 30,000. Truncating.`);
            allRules = allRules.slice(0, 30000);
        }

        if (allRules.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: allRules,
            });
        
            await browser.storage.local.set({
                ruleCategories: finalRuleCategories,
                ruleMetadata: finalRuleMetadata
            });
        }
    } catch (error) {
        console.error("Error applying rules:", error);
    }
}

async function getRuleCounter(): Promise<number> {
    // Retrieve the rule counter from storage, defaulting to 1 if not set
    const data = await browser.storage.local.get('ruleCounter');
    return data.ruleCounter || 1;
}

async function setRuleCounter(counter: number): Promise<void> {
    // Store the updated rule counter
    await browser.storage.local.set({ ruleCounter: counter });
}

if (browser.storage) {
    browser.storage.onChanged.addListener(async (changes, area) => {
        if (area === 'local' && changes.settings) {
            const newSettings = changes.settings.newValue;
            const oldSettings = changes.settings.oldValue || {};
            
            // Check if blocking settings have changed
            if (
                newSettings.blockAnalytics !== oldSettings.blockAnalytics ||
                newSettings.blockAdvertising !== oldSettings.blockAdvertising ||
                newSettings.blockSocial !== oldSettings.blockSocial ||
                newSettings.blockOther !== oldSettings.blockOther
            ) {
                console.log("Blocking settings changed, updating rules...");
                await fetchAndProcessEasyLists();
            }
        }
    });
} else {
    console.error('browser.storage API is unavailable');
}

if (browser.alarms) {
    browser.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'updateEasyList') {
            console.log("Alarm triggered: Updating EasyList rules...");
            fetchAndProcessEasyLists();
        }
    });
} else {
    console.error('chrome.alarms API is unavailable');
}

if (browser.declarativeNetRequest) {
    browser.alarms.create('checkRuleMatches', { periodInMinutes: 1 });
    console.log("Set up tracker stats monitoring");
} else {
    console.error('declarativeNetRequest API is unavailable');
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
