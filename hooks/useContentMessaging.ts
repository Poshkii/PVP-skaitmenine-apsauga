import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ContentMessage, ContentMessageId} from "@/entrypoints/content/types/content-message.ts";

function sendMessage(message: ContentMessage) {
    // Send message to content script
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            browser.tabs.sendMessage(tabs[0].id, message);
        }
    });
}

export function useContentMessaging() {
    const sendModuleChangeMessage = useCallback((moduleId: ModuleId, enabled: boolean) => {
        sendMessage({
            id: ContentMessageId.ModuleChange,
            data: {
                moduleId,
                enabled
            }
        });
    }, []);

    return { sendModuleChangeMessage };
}