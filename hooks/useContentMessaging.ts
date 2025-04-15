import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ContentMessage, ContentMessageId} from "@/entrypoints/content/types/content-message.ts";
import {ModuleMessage} from "@/entrypoints/content/types/module-message.ts";

function sendMessage(message: ContentMessage) {
    // Send message to content script
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            browser.tabs.sendMessage(tabs[0].id, message);
        }
    });
}

export function useContentMessaging() {
    const changeContentModuleState = useCallback((moduleId: ModuleId, enabled: boolean) => {
        sendMessage({
            id: ContentMessageId.ModuleChange,
            data: {
                moduleId,
                enabled
            }
        });
    }, []);

    const sendToModule = useCallback((moduleId: ModuleId, message: ModuleMessage) => {
        const moduleMessage: ContentMessage = {
            id: ContentMessageId.SendModuleMessage,
            data: {
                moduleId: moduleId,
                moduleMessage: message,
            }
        }

        return sendMessage(moduleMessage);
    }, []);

    return { changeContentModuleState, sendToModule };
}