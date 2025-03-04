import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";
import {PasswordChecker} from "@/entrypoints/content/modules/password-checker/password-checker.ts";
import {Configuration} from "@/utils/config.ts";

export default defineContentScript({
  matches: ['*://*/*'],
  async main() {
    // TODO: messaging with the settings frontend so modules get loaded and unloaded dynamically

    const config = new Configuration();
    await config.load();

    const moduleManager = new ModuleManager()

    const passwordChecker = new PasswordChecker();
    moduleManager.registerModule(passwordChecker, config.isModuleEnabled(passwordChecker.id));
  },
});
