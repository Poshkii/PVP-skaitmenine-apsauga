import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from '../../src/locales/en/translation.json';
import ltTranslation from '../../src/locales/lt/translation.json';
import ltSettings from '../../src/locales/lt/settings.json';
import enSettings from '../../src/locales/en/settings.json';
import ltMeniu from '../../src/locales/lt/meniu.json';
import enMeniu from '../../src/locales/en/meniu.json';

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: {
            en: { 
              translation: enTranslation,
              settings: enSettings,
              meniu: enMeniu
             },
            lt: { 
              translation: ltTranslation,
              settings: ltSettings,
              meniu: ltMeniu
             }
          },
        fallbackLng: 'en',
        ns: ['translation', 'settings', 'meniu'],
        defaultNS: 'translation'
})

export default i18next;