import { defineAppConfig } from 'wxt/sandbox';

// Define types for your config
declare module 'wxt/sandbox' {
    export interface WxtAppConfig {
        safeBrowsingApiKey?: string;
        fileCheckerApiKey?: string;
        hybridAnalysisApiKey?: string;
    }
}

export default defineAppConfig({
    safeBrowsingApiKey: import.meta.env.WXT_VIRUSTOTAL_API_KEY,
    fileCheckerApiKey: import.meta.env.WXT_METADEFENDER_CLOUD_API_KEY,
    hybridAnalysisApiKey: import.meta.env.WXT_HYBRIDANALYSIS_API_KEY
});