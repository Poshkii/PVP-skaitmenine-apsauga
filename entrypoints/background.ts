export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Listen for messages from the content script
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "OPEN_EXTENSION_POPUP") {
      console.log("Opening extension popup...");

      // Open the extension's UI
      browser.action.openPopup()
    }
  });
});