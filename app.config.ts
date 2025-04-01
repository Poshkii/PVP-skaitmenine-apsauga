import { defineAppConfig } from 'wxt/sandbox';

// Define types for your config
declare module 'wxt/sandbox' {
    export interface WxtAppConfig {
        privacyApiUrl?: string;
        virusTotalApiUrl?: string;
        metaDefenderApiUrl?: string;
        urlScanApiUrl?: string;
    }
}

export default defineAppConfig({
    privacyApiUrl: import.meta.env.WXT_PRIVACY_API_URL,
    virusTotalApiUrl: import.meta.env.WXT_PRIVACY_API_URL + import.meta.env.WXT_VIRUSTOTAL_ENDPOINT,
    metaDefenderApiUrl: import.meta.env.WXT_PRIVACY_API_URL + import.meta.env.WXT_METADEFENDER_ENDPOINT,
    urlScanApiUrl: import.meta.env.WXT_PRIVACY_API_URL + import.meta.env.WXT_URLSCAN_ENDPOINT,
});