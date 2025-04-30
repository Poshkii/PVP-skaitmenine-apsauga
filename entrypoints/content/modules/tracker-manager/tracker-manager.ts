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
    blockFingerprints: boolean;
    advancedProtection?: boolean;
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
        
        this.applyProtections();
    }

    unload(): void {
        console.log("Unloading tracker manager module");
        this.removeEventListeners();
        
        if (browser.alarms) {
            browser.alarms.clear('updateEasyList');
            browser.alarms.clear('checkRuleMatches');
        }
    }

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
                blockFingerprints: true,
                lastUpdated: null
            }
        });
    }

    // Method to check if advanced protection is enabled
    private async checkAdvancedProtection(): Promise<boolean> {
        const data = await chrome.storage.local.get('settings');
        return data.settings?.advancedProtection ?? false;
    }

    // Method to apply anti-fingerprinting protections
    private async applyProtections(): Promise<void> {
        const advancedProtectionEnabled = await this.checkAdvancedProtection();

        if (!advancedProtectionEnabled) return;

        try {
            // Canvas fingerprinting protection
            if (HTMLCanvasElement.prototype.toDataURL) {
                const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function(type?: string, quality?: number) {
                    if (type === 'image/png' && this.width === 16 && this.height === 16) {
                        const ctx = this.getContext('2d');
                        if (ctx !== null) {
                            const imageData = ctx.getImageData(0, 0, this.width, this.height);
                            const data = imageData.data;
                            const i = Math.floor(Math.random() * data.length / 4) * 4;
                            data[i] = Math.max(0, Math.min(255, data[i] + (Math.random() < 0.5 ? 1 : -1)));
                            ctx.putImageData(imageData, 0, 0);
                        }
                    }
                    return originalToDataURL.call(this, type, quality);
                };
            }

            // Audio fingerprinting protection
            if (window.AudioContext) {
                const OriginalAudioContext = window.AudioContext;
                
                // Override AudioContext constructor
                window.AudioContext = function(this: AudioContext, ...args: any[]): AudioContext {
                    const context = new OriginalAudioContext(...args);
                
                    // Save the original decodeAudioData method
                    const originalDecodeAudioData = context.decodeAudioData;
                
                    // Override decodeAudioData to return a Promise and modify AudioBuffer's getChannelData
                    context.decodeAudioData = function(this: AudioContext, audioData: ArrayBuffer): Promise<AudioBuffer> {
                    return new Promise((resolve, reject) => {
                        originalDecodeAudioData.call(this, audioData, (audioBuffer: AudioBuffer) => {
                        // Override getChannelData of AudioBuffer
                        const originalGetChannelData = audioBuffer.getChannelData;
                        
                        audioBuffer.getChannelData = function(this: AudioBuffer, channel: number): Float32Array {
                            const channelData = originalGetChannelData.call(this, channel);
                            
                            // Add minimal noise that won't affect audio quality
                            const noise = 0.0000001;
                
                            // Only modify a small subset of samples to minimize impact
                            if (channelData.length > 0 && Math.random() < 0.1) {
                            const index = Math.floor(Math.random() * channelData.length);
                            channelData[index] += (Math.random() * 2 - 1) * noise;
                            }
                
                            return channelData;
                        };
                
                        // Resolve the promise with the modified audio buffer
                        resolve(audioBuffer);
                        }, reject); // Reject the promise if an error occurs
                    });
                    };
                
                    return context;
                } as any; // Type the function as 'any' to bypass the constructor signature error
            } 

            // Font fingerprinting protection
            if (document.fonts && document.fonts.check) {
                const originalCheck = document.fonts.check;
                
                // Override the check method
                document.fonts.check = function(this: FontFaceSet, font: string, text?: string): boolean {
                    const uncommonFonts = [
                        'Copperplate Gothic', 'Wingdings', 'Webdings', 'Comic Sans MS',
                        'Papyrus', 'Herculanum', 'Apple Chancery'
                    ];
                
                    for (const uncommonFont of uncommonFonts) {
                        if (font.includes(uncommonFont) && Math.random() < 0.1) {
                            return Math.random() < 0.5;
                        }
                    }
                
                    // Use the original method with the correct types
                    return originalCheck.apply(this, [font, text]);
                };
            }

            // Navigator and screen property fingerprinting
            try {
                if (Object.getOwnPropertyDescriptor(Navigator.prototype, 'hardwareConcurrency')) {
                    Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
                        get: function () {
                            const commonValues = [2, 4, 8];
                            return commonValues[Math.floor(Math.random() * commonValues.length)];
                        }
                    });
                }

                if (Object.getOwnPropertyDescriptor(Navigator.prototype, 'deviceMemory')) {
                    Object.defineProperty(Navigator.prototype, 'deviceMemory', {
                        get: function () {
                            const commonValues = [4, 8];
                            return commonValues[Math.floor(Math.random() * commonValues.length)];
                        }
                    });
                }
            } catch (e) {
                console.error("Error applying navigator protections:", e);
            }

            console.log("Applied anti-fingerprinting protections");
        } catch (error) {
            console.error("Error in privacy protections:", error);
        }
    }

    // Method to detect and report tracking cookies
    private detectTrackingCookies(): void {
        try {
            const cookies = document.cookie.split(';');
            const trackingKeywords = ['track', 'ga', '_ga', 'fb', 'pixel', 'visitor', 'session'];

            const trackingCookies = cookies.filter(cookie => {
                const cookieName = cookie.trim().split('=')[0].toLowerCase();
                return trackingKeywords.some(keyword => cookieName.includes(keyword));
            });

            if (trackingCookies.length > 0) {
                chrome.runtime.sendMessage({
                    action: 'trackingCookiesDetected',
                    count: trackingCookies.length,
                    domain: window.location.hostname
                });
            }
        } catch (e) {
            console.error("Error detecting tracking cookies:", e);
        }
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
                                this.updateBadge(tabId, matchedRules.length);
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

    async fetchAndProcessEasyLists(): Promise<void> {
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
            await this.applyRules(rulesets);
            
            // Update last updated timestamp
            const newSettings = { ...settings, lastUpdated: new Date().toISOString() };
            browser.storage.local.set({ settings: newSettings });
            
            console.log("EasyList rules updated successfully");
        } catch (error) {
            console.error("Error processing EasyList rules:", error);
            throw error; // Rethrow so caller can handle it
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
                    addRules: allRules,
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

    handleMessage(message: ModuleMessage): any {
        super.handleMessage(message);

        switch (message.id){
            case ModuleMessageId.UpdateTrackerRules: {
                console.log("Received request to update tracker rules");
                try {
                    this.fetchAndProcessEasyLists();
                    this.sendToRuntime({id: UiMessageId.UpdateTrackerRules});
                } catch (error) {
                    console.error("Failed to update ruleset:", error);
                    this.sendToRuntime({id: UiMessageId.TrackerRulesError, data: { message: (error as any).message }});
                }
                break; 
            }
            case ModuleMessageId.ResetTrackerStats: {
                this.resetTrackerStats();
                break;
            }
        }
    }
}