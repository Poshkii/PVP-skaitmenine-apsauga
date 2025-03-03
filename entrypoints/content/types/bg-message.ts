export enum BgMessageId {
    OpenPopup = "OPEN_EXTENSION_POPUP",
    NavigateTo = "NAVIGATE_TO",
    PopupOpened = "POPUP_OPENED"
}

export interface BgMessage {
    id: BgMessageId;
    data?: any;
}