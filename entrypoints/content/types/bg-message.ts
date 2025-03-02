export enum BgMessageId {
    OpenPopup = "OPEN_EXTENSION_POPUP"
}

export interface BgMessage {
    id: BgMessageId;
    data?: any;
}