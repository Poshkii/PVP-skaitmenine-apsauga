import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";

export default defineBackground(() => {
    // Listen for messages from the content script
    browser.runtime.onMessage.addListener((message: BgMessage) => {
        switch (message.id) {
            case BgMessageId.OpenPopup: {
                console.log("Opening extension popup...");

                // Open the extension's UI
                browser.action.openPopup()
                break;
            }
            case BgMessageId.NavigateTo: {
                waitForPopup(() => {
                    browser.runtime.sendMessage({id: UiMessageId.NavigateTo, data: message.data.route});
                });
            }
        }
    });
});

function waitForPopup(callback: () => void) {
    const onMessage = (message: BgMessage) => {
        switch (message.id) {
            case BgMessageId.PopupOpened: {
                browser.runtime.onMessage.removeListener(onMessage);
                callback();
            }
        }
    }

    browser.runtime.onMessage.addListener(onMessage);

    browser.action.openPopup();
}