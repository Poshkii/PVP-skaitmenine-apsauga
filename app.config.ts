import { defineAppConfig } from 'wxt/sandbox';

// Define types for your config
declare module 'wxt/sandbox' {
    export interface WxtAppConfig {
        safeBrowsingApiKey?: string;
    }
}

export default defineAppConfig({
    safeBrowsingApiKey: import.meta.env.WXT_SAFEBROWSING_API_KEY,
});