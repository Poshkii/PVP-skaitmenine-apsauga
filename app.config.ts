import { defineAppConfig } from 'wxt/sandbox';

// Define types for your config
declare module 'wxt/sandbox' {
    export interface WxtAppConfig {
        safeBrowsingApiKey?: string;
        fileCheckerApiKey?: string;
    }
}

export default defineAppConfig({
    safeBrowsingApiKey: import.meta.env.WXT_SAFEBROWSING_API_KEY,
    fileCheckerApiKey: import.meta.env.WXT_METADEFENDER_CLOUD_API_KEY
});