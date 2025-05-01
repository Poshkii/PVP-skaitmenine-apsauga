export enum ModuleMessageId {
    PollFileScan,
    UpdateTrackerRules,
    ApplyProtections,
    ResetTrackerStats,
    ReadDom
}

export interface ModuleMessage {
    id: ModuleMessageId;
    data?: any;
}