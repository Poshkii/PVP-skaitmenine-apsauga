export enum ModuleId {
    PasswordChecker,
}


export interface Module {
    readonly id: ModuleId;
    isEnabled: boolean;

    load(): void;

    unload(): void;
}