import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";
import {PasswordChecker} from "@/entrypoints/content/modules/password-checker/password-checker.ts";

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    const moduleManager = new ModuleManager()

    const passwordChecker = new PasswordChecker();
    moduleManager.registerModule(passwordChecker);

    // TODO: messaging between modules
    // TODO: a way to send/receive messages to bg?
  },
});
