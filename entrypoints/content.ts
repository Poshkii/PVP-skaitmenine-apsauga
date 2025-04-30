import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";
import {PasswordChecker} from "@/entrypoints/content/modules/password-checker/password-checker.ts";
import {EmailChecker} from "@/entrypoints/content/modules/email-checker/email-checker.ts";
import {Configuration} from "@/utils/config.ts";
import {ContentMessage, ContentMessageId} from "@/entrypoints/content/types/content-message.ts";
import {PhishChecker} from "@/entrypoints/content/modules/emailPhish-checker/emailPhish-checker.ts";
import {TrackerBlocker} from "@/entrypoints/content/modules/tracker-blocker/tracker-blocker.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";

export default defineContentScript({
    matches: ['*://*/*'],
    async main() {
        const config = new Configuration();
        await config.load();

        const moduleManager = new ModuleManager()

        const passwordChecker = new PasswordChecker();
        moduleManager.registerModule(passwordChecker, config.isModuleEnabled(passwordChecker.id));

        const emailChecker = new EmailChecker();
        moduleManager.registerModule(emailChecker, config.isModuleEnabled(emailChecker.id));

        const phishChecker = new PhishChecker();
        moduleManager.registerModule(phishChecker, config.isModuleEnabled(phishChecker.id));

        const trackerBlocker = new TrackerBlocker();
        moduleManager.registerModule(trackerBlocker, config.isModuleEnabled(trackerBlocker.id));

        browser.runtime.onMessage.addListener((message: ContentMessage) => {
            switch (message.id) {
                case ContentMessageId.ModuleChange: {
                    const {moduleId, enabled} = message.data;

                    if (enabled) {
                        moduleManager.loadModule(moduleId);
                    } else {
                        moduleManager.unloadModule(moduleId);
                    }
                    break;
                }
                case ContentMessageId.SendModuleMessage: {
                    const { moduleId, moduleMessage } = message.data;
                    moduleManager.sendMessage(moduleId, moduleMessage);
                    break;
                }
            }
        });
    },
});