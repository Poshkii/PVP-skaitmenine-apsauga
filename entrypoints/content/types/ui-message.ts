export enum UiMessageId {
    NavigateTo = "NAVIGATE_TO",
    ScanFinished = "SCAN_FINISHED",
    VirusTotalScanFinished = "VIRUSTOTAL_SCAN_FINISHED",
    UrlScanFinished = "URL_SCAN_FINISHED",
}

export interface UiMessage {
    id: UiMessageId;
    data?: any;
}