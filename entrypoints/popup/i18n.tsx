import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from '../../public/locales/en/translation.json';
   import ltTranslation from '../../public/locales/lt/translation.json';

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: {
            en: { translation: enTranslation },
            lt: { translation: ltTranslation }
          },
        fallbackLng: 'en'

})

export default i18next;