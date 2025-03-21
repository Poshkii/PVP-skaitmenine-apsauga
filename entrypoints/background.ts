import { FileChecker } from "@/entrypoints/content/modules/file-checker/file-checker.ts";
import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";


export default defineBackground(() => {
    console.log("Background script initialized.");

    const fileChecker = new FileChecker();
    fileChecker.load();

    console.log("FileChecker loaded in background.");

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