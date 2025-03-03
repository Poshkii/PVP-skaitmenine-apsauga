export enum UiMessageId {
    NavigateTo = "NAVIGATE_TO"
}

export interface UiMessage {
    id: UiMessageId;
    data?: any;
}