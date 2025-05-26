import i18next from "i18next";
import en from "../../../src/locales/en/content.json";
import lt from "../../../src/locales/lt/content.json";

const resources = {
  en: { translation: en },
  lt: { translation: lt },
};

chrome.storage.sync.get(['language'], (result) => {
  const language = result.language || 'en';

  i18next.init({
    lng: language,
    fallbackLng: "en",
    debug: false,
    resources,
  }).then(() => {
    console.log("i18next initialized with language:", language);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "LANGUAGE_CHANGED") {
    const newLang = message.language;
    i18next.changeLanguage(newLang).then(() => {
      console.log("Language changed to:", newLang);
    });
  }
});

export default i18next;
