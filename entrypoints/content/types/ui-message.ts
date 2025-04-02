export enum UiMessageId {
    NavigateTo = "NAVIGATE_TO",
    ScanFinished = "SCAN_FINISHED",
    CookiesRetrieved = "COOKIES_RETRIEVED",
    CookiesError = "COOKIES_ERROR",
}

export interface UiMessage {
    id: UiMessageId;
    data?: any;
}