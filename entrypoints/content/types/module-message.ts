export enum ModuleMessageId {
    PollFileScan,
    UpdateTrackerRules,
    ReadDom
}

export interface ModuleMessage {
    id: ModuleMessageId;
    data?: any;
}