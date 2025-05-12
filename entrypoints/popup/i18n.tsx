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
import ltPasswords from '../../src/locales/lt/passwords.json';
import enPasswords from '../../src/locales/en/passwords.json';
import ltCookies from '../../src/locales/lt/cookies.json';
import enCookies from '../../src/locales/en/cookies.json';
import ltEmails from '../../src/locales/lt/emails.json';
import enEmails from '../../src/locales/en/emails.json';
import ltLogin from '../../src/locales/lt/login.json';
import enLogin from '../../src/locales/en/login.json';
import ltReport from '../../src/locales/lt/report.json';
import enReport from '../../src/locales/en/report.json';
import ltDataUsage from '../../src/locales/lt/dataUsage.json';
import enDataUsage from '../../src/locales/en/dataUsage.json';
import ltInfo from '../../src/locales/lt/info.json';
import enInfo from '../../src/locales/en/info.json';
import ltPhishEmail from '../../src/locales/lt/phishEmail.json';
import enPhishEmail from '../../src/locales/en/phishEmail.json';
import ltTrackers from '../../src/locales/lt/trackers.json';
import enTrackers from '../../src/locales/en/trackers.json';
import ltUnauthorized from '../../src/locales/lt/unauthorized.json';
import enUnauthorized from '../../src/locales/en/unauthorized.json';

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: {
            en: { 
              files: enFiles,
              settings: enSettings,
              meniu: enMeniu,
              urls: enUrls,
              passwords: enPasswords,
              cookies: enCookies,
              emails: enEmails,
              login: enLogin,
              report: enReport,
              dataUsage: enDataUsage,
              info: enInfo,
              phishEmail: enPhishEmail,
              trackers: enTrackers,
              unauthorized: enUnauthorized
             },
            lt: { 
              files: ltFiles,
              settings: ltSettings,
              meniu: ltMeniu,
              urls: ltUrls,
              passwords: ltPasswords,
              cookies: ltCookies,
              emails: ltEmails,
              login: ltLogin,
              report: ltReport,
              dataUsage: ltDataUsage,
              info: ltInfo,
              phishEmail: ltPhishEmail,
              trackers: ltTrackers,
              unauthorized: ltUnauthorized
             }
          },
        fallbackLng: 'en',
        ns: ['files', 'settings', 'meniu', 'urls', 'passwords', 'cookies', 'emails', 'login', 'report', 'dataUsage', 'info', 'phishEmail', 'trackers', 'unauthorized'],
        defaultNS: 'settings'
})

export default i18next;