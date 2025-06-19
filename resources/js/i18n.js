import '../../Modules/Core/resources/js/i18n';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en','ar'],
    debug: false,
    ns: ['common', 'employees', 'projects', 'project', 'equipment', 'rentals', 'timesheet', 'payrolls', 'mobile', 'analytics', 'booking', 'customer'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['querystring','cookie','localStorage','navigator'],
      caches: ['cookie']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
