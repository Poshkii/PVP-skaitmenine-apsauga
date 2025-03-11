import {Module, ModuleId} from "../../types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";

export class FileChecker extends Module {
    readonly id = ModuleId.FileChecker;

    load(): void {
        document.addEventListener("focusin", this.onFocusIn);
        document.addEventListener("focusout", this.onFocusOut);
    }

    unload(): void {
        document.removeEventListener("focusin", this.onFocusIn);
        document.removeEventListener("focusout", this.onFocusOut);
    }

    private readDownloadFile(file: File) {
        
    }

    private onFocusIn = (event: FocusEvent) => {
        
    }

    private onFocusOut = (event: FocusEvent) => {
        
    }
}