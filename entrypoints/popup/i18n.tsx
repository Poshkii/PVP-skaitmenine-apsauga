import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enFiles from '../../src/locales/en/files.json';
import ltFiles from '../../src/locales/lt/files.json';
import ltSettings from '../../src/locales/lt/settings.json';
import enSettings from '../../src/locales/en/settings.json';
import ltMeniu from '../../src/locales/lt/meniu.json';
import enMeniu from '../../src/locales/en/meniu.json';
import ltUrls from '../../src/locales/lt/urls.json';
import enUrls from '../../src/locales/en/urls.json';

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: {
            en: { 
              files: enFiles,
              settings: enSettings,
              meniu: enMeniu,
              urls: enUrls
             },
            lt: { 
              files: ltFiles,
              settings: ltSettings,
              meniu: ltMeniu,
              urls: ltUrls
             }
          },
        fallbackLng: 'en',
        ns: ['files', 'settings', 'meniu', 'urls'],
        defaultNS: 'settings'
})

export default i18next;