export enum ModuleMessageId {
    PollFileScan,
    PollVirusTotalScan,
    PollUrlScan,
}

export interface ModuleMessage {
    id: ModuleMessageId;
    data?: any;
}