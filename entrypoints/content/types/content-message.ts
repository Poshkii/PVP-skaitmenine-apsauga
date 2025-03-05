export enum ContentMessageId {
    ModuleChange = "MODULE_CHANGE"
}

export interface ContentMessage {
    id: ContentMessageId;
    data?: any;
}