import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message-id.ts";

export default defineBackground(() => {
  // Listen for messages from the content script
  browser.runtime.onMessage.addListener((message: BgMessage) => {
    switch (message.id) {
      case BgMessageId.OpenPopup: {
        console.log("Opening extension popup...");

        // Open the extension's UI
        browser.action.openPopup()
      }
    }
  });
});