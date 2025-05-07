export enum ModuleMessageId {
    PollFileScan,
    UpdateTrackerRules,
    ApplyProtections,
    ResetTrackerStats,
    ReadDom,
    ProcessEmlData
}

export interface ModuleMessage {
    id: ModuleMessageId;
    data?: any;
}