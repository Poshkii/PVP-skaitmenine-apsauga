export enum UiMessageId {
    NavigateTo = "NAVIGATE_TO",
    ScanFinished = "SCAN_FINISHED",
    CookiesRetrieved = "COOKIES_RETRIEVED",
    CookiesError = "COOKIES_ERROR",
    EmailBreachData = "EMAIL_BREACH_DATA",
    ScanEmail = "SCAN_EMAIL",
    PopupReady = "POPUP_READY"
}

export interface UiMessage {
    id: UiMessageId;
    data?: any;
}