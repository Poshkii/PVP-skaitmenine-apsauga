import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {ModuleMessage} from "@/entrypoints/content/types/module-message.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";

export function useModuleMessaging() {
    const sendToModule = useCallback((moduleId: ModuleId, message: ModuleMessage) => {
        const moduleMessage: BgMessage = {
            id: BgMessageId.SendModuleMessage,
            data: {
                moduleId: moduleId,
                moduleMessage: message,
            }
        }

        return browser.runtime.sendMessage(moduleMessage);
    }, []);

    const changeBgModuleState = useCallback((moduleId: ModuleId, enabled: boolean) => {
        const message: BgMessage = {
            id: BgMessageId.ModuleChange,
            data: {
                moduleId,
                enabled,
            }
        };

        return browser.runtime.sendMessage(message);
    }, []);

    return { sendToModule, changeBgModuleState };
}