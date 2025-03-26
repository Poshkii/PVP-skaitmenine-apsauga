export enum UiMessageId {
    NavigateTo = "NAVIGATE_TO",
    ScanFinished = "SCAN_FINISHED",
}

export interface UiMessage {
    id: UiMessageId;
    data?: any;
}