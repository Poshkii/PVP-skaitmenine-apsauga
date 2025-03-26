import {FileChecker} from "@/entrypoints/content/modules/file-checker/file-checker.ts";
import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";
import {Configuration} from "@/utils/config.ts";


export default defineBackground(async () => {
    console.log("Background script initialized.");
    const config = new Configuration();
    await config.load();

    const fileChecker = new FileChecker();
    const moduleManager = new ModuleManager();
    moduleManager.registerModule(fileChecker, config.isModuleEnabled(fileChecker.id));

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
                break;
            }
            case BgMessageId.ModuleChange: {
                const { moduleId, enabled } = message.data;

                if (enabled) {
                    moduleManager.loadModule(moduleId);
                } else {
                    moduleManager.unloadModule(moduleId);
                }
                break;
            }
            case BgMessageId.SendModuleMessage: {
                const { moduleId, moduleMessage } = message.data;
                moduleManager.sendMessage(moduleId, moduleMessage);
                break;
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