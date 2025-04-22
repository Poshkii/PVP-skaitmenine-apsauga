export enum ContentMessageId {
    ModuleChange = "MODULE_CHANGE",
    SendModuleMessage = "MODULE_MESSAGE",
}

export interface ContentMessage {
    id: ContentMessageId;
    data?: any;
}