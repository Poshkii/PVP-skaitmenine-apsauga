import {Module, ModuleId} from "../../types/module.ts";
import {ModuleMessage, ModuleMessageId} from "../../types/module-message.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {fetchEasyList, parseEasyList, categorizeRules, createRulesets} from "@/utils/easyListParse.ts";

const EASYLIST_URL = 'https://easylist.to/easylist/easylist.txt';
const EASYPRIVACY_URL = 'https://easylist.to/easylist/easyprivacy.txt';

export interface TrackerSettings {
    blockAnalytics: boolean;
    blockAdvertising: boolean;
    blockSocial: boolean;
    blockOther: boolean;
    lastUpdated: string | null;
}

export interface TrackerStats {
    total: number;
    analytics: number;
    advertising: number;
    social: number;
    other: number;
}

export class TrackerManager extends Module { 
    readonly id = ModuleId.TrackerManager;

    load(): void {
        console.log("Initializing tracker manager module");
        this.initializeTrackerBlocking();
        this.setupEventListeners();
        this.fetchAndProcessEasyLists().catch(err => {
            console.error("Initial rules fetch failed:", err);
        });
        
        browser.alarms.create('updateEasyList', { periodInMinutes: 60 * 24 });
    }

    unload(): void {
        console.log("Unloading tracker manager module");
        this.removeEventListeners();
        
        if (browser.alarms) {
            browser.alarms.clear('updateEasyList');
            browser.alarms.clear('checkRuleMatches');
        }
    }

    private isUpdatingRules = false;

    private setupEventListeners(): void {
        // Listen for web navigation events
        browser.webNavigation.onCompleted.addListener(this.handleWebNavigationComplete.bind(this));
        
        // Listen for storage changes
        if (browser.storage) {
            browser.storage.onChanged.addListener(this.handleStorageChange.bind(this));
        } else {
            console.error('browser.storage API is unavailable');
        }
        
        // Set up alarms listener
        if (browser.alarms) {
            browser.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
            browser.alarms.create('checkRuleMatches', { periodInMinutes: 1 });
            console.log("Set up tracker stats monitoring");
        } else {
            console.error('chrome.alarms API is unavailable');
        }
    }

    private removeEventListeners(): void {
        browser.webNavigation.onCompleted.removeListener(this.handleWebNavigationComplete.bind(this));
        
        if (browser.storage) {
            browser.storage.onChanged.removeListener(this.handleStorageChange.bind(this));
        }
        
        if (browser.alarms) {
            browser.alarms.onAlarm.removeListener(this.handleAlarm.bind(this));
        }
    }

    private handleWebNavigationComplete(details: chrome.webNavigation.WebNavigationFramedCallbackDetails): void {
        // Only process main frame navigations (not iframes)
        if (details.frameId === 0) {
            console.log(`Page loaded: ${details.url}`);
            this.checkTrackersOnPage(details.tabId, details.url);
        }
    }

    private handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, area: string): void {
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
                this.fetchAndProcessEasyLists();
            }
        }
    }

    private handleAlarm(alarm: chrome.alarms.Alarm): void {
        if (alarm.name === 'updateEasyList') {
            console.log("Alarm triggered: Updating EasyList rules...");
            this.fetchAndProcessEasyLists();
        }
    }

    private initializeTrackerBlocking(): void {
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
                lastUpdated: null
            }
        });
    }



    private checkTrackersOnPage(tabId: number, url: string): void {
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
                                this.updateStatsFromMatches(matchedRules);
                                //this.updateBadge(tabId, matchedRules.length);
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

    private updateStatsFromMatches(matchedRules: chrome.declarativeNetRequest.MatchedRuleInfo[]): void {
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

    private resetTrackerStats(): void {
        const resetStats = {
            total: 0,
            analytics: 0,
            advertising: 0,
            social: 0,
            other: 0
        };
        
        browser.storage.local.set({ blockStats: resetStats }, () => {
            console.log("Tracker stats have been reset");
        });
    }
      
    // Update the extension badge to show number of trackers blocked
    private updateBadge(tabId: number, count: number): void {
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

    private async fetchAndProcessEasyLists(): Promise<void> {
        if (this.isUpdatingRules) {
            console.warn("Rules update already in progress, skipping...");
            return;
        }

        this.isUpdatingRules = true;
        console.log("Fetching EasyList rules");

        try {
            // Get user settings
            const data = await browser.storage.local.get('settings');
            const settings = data.settings || {
                blockAnalytics: true,
                blockAdvertising: true,
                blockSocial: true,
                blockOther: true,
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
            await this.applyRules(rulesets);
            
            // Update last updated timestamp
            const newSettings = { ...settings, lastUpdated: new Date().toISOString() };
            browser.storage.local.set({ settings: newSettings });
            
            console.log("EasyList rules updated successfully");
        } catch (error) {
            console.error("Error processing EasyList rules:", error);
            throw error;
        } finally {
            this.isUpdatingRules = false;
        }
    }

    private async applyRules(rulesets: Record<string, chrome.declarativeNetRequest.Rule[]>): Promise<void> {
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

            let ruleCounter = await this.getRuleCounter();
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
            
            await this.setRuleCounter(ruleCounter);

            if (allRules.length > 30000) {
                console.warn(`Rule count (${allRules.length}) exceeds Chrome limit of 30,000. Truncating.`);
                allRules = allRules.slice(0, 30000);
            }

            if (allRules.length > 0) {
                await chrome.declarativeNetRequest.updateDynamicRules({
                    addRules: allRules
                });
            
                await browser.storage.local.set({
                    ruleCategories: finalRuleCategories,
                    ruleMetadata: finalRuleMetadata
                });
            }
        } catch (error) {
            console.error("Error applying rules:", error);
            throw error;
        }
    }

    private async getRuleCounter(): Promise<number> {
        // Retrieve the rule counter from storage, defaulting to 1 if not set
        const data = await browser.storage.local.get('ruleCounter');
        return data.ruleCounter || 1;
    }

    private async setRuleCounter(counter: number): Promise<void> {
        // Store the updated rule counter
        await browser.storage.local.set({ ruleCounter: counter });
    }

    async handleMessage(message: ModuleMessage): Promise<void> {
        super.handleMessage(message);

        switch (message.id){
            case ModuleMessageId.UpdateTrackerRules: {
                console.log("Received request to update tracker rules");
                try {
                    await this.fetchAndProcessEasyLists();
                    this.sendToRuntime({id: UiMessageId.UpdateTrackerRules});
                } catch (error) {
                    console.error("Failed to update ruleset:", error);
                    this.sendToRuntime({id: UiMessageId.TrackerRulesError, data: { message: (error as any).message }});
                }
                break; 
            }
            case ModuleMessageId.ResetTrackerStats: {
                this.resetTrackerStats();
                this.sendToRuntime({id: UiMessageId.TrackerReset});
                break;
            }
        }
    }
}