import {BgMessage} from "@/entrypoints/content/types/bg-message.ts";
import EventEmitter from "eventemitter3";
import {ModuleMessage} from "@/entrypoints/content/types/module-message.ts";
import {UiMessage} from "@/entrypoints/content/types/ui-message.ts";

export enum ModuleId {
    PasswordChecker,
    EmailChecker,
    FileChecker,
    UrlChecker
}

export abstract class Module extends EventEmitter {
    abstract readonly id: ModuleId;

    abstract load(): void;

    abstract unload(): void;

    protected sendToRuntime(message: BgMessage | UiMessage): any {
        browser.runtime.sendMessage(message, (response) => {
            if (browser.runtime.lastError) {
                console.error("Error sending message:", browser.runtime.lastError);
            } else {
                return response;
            }
        });
    }

    handleMessage(message: ModuleMessage): any {
        // override if module needs to handle messages
    }
}