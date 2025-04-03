export enum BgMessageId {
    OpenPopup = "OPEN_EXTENSION_POPUP",
    NavigateTo = "BG_NAVIGATE_TO",
    PopupOpened = "POPUP_OPENED",
    ModuleChange = "MODULE_CHANGE",
    SendModuleMessage = "MODULE_MESSAGE",
    GetCookies = "GET_COOKIES",
    GetEmailData = "GET_EMAIL_DATA",
    StoreEmailData = "STORE_EMAIL_DATA",
}

export interface BgMessage {
    id: BgMessageId;
    data?: any;
}