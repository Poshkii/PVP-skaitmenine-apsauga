export enum BgMessageId {
    OpenPopup = "OPEN_EXTENSION_POPUP",
    NavigateTo = "BG_NAVIGATE_TO",
    PopupOpened = "POPUP_OPENED",
    ModuleChange = "MODULE_CHANGE",
    SendModuleMessage = "MODULE_MESSAGE",
    GetCookies = "GET_COOKIES",
}

export interface BgMessage {
    id: BgMessageId;
    data?: any;
}