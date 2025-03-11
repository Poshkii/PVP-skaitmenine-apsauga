import {BgMessage} from "@/entrypoints/content/types/bg-message.ts";
import EventEmitter from "eventemitter3";

export enum ModuleId {
    PasswordChecker,
    FileChecker,
}

export abstract class Module extends EventEmitter {
    abstract readonly id: ModuleId;

    abstract load(): void;

    abstract unload(): void;

    protected sendToBackground(message: BgMessage): any {
        browser.runtime.sendMessage(message, (response) => {
            if (browser.runtime.lastError) {
                console.error("Error sending message:", browser.runtime.lastError);
            } else {
                return response;
            }
        });
    }
}