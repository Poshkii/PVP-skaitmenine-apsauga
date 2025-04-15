export enum ModuleMessageId {
    PollFileScan,
    ReadDom
}

export interface ModuleMessage {
    id: ModuleMessageId;
    data?: any;
}