export enum ModuleMessageId {
    PollFileScan
}

export interface ModuleMessage {
    id: ModuleMessageId;
    data?: any;
}