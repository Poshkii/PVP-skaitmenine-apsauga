import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";
import {PasswordChecker} from "@/entrypoints/content/modules/password-checker/password-checker.ts";
import {EmailChecker} from "@/entrypoints/content/modules/email-checker/email-checker.ts";
import {FileChecker} from "@/entrypoints/content/modules/file-checker/file-checker.ts";
import {Configuration} from "@/utils/config.ts";
import {ContentMessage, ContentMessageId} from "@/entrypoints/content/types/content-message.ts";
//import EmailChecker from "@/components/pages/email-checker/EmailChecker";

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
        const fileChecker = new FileChecker();
        moduleManager.registerModule(fileChecker, config.isModuleEnabled(fileChecker.id));

        browser.runtime.onMessage.addListener((message: ContentMessage) => {
            switch (message.id) {
                case ContentMessageId.ModuleChange: {
                    const {moduleId, enabled} = message.data;

                    if (enabled) {
                        moduleManager.loadModule(moduleId);
                    } else {
                        moduleManager.unloadModule(moduleId);
                    }
                }
            }
        });
    },
});