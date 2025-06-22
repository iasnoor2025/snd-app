import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

type ModuleMap = {
  [key: string]: string;
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    ns: [
      'common',
      'core',
      'employees',
      'projects',
      'equipment',
      'rentals',
      'payrolls',
      'mobile',
      'analytics',
      'booking',
      'project',
      'timesheet',
      'customer'
    ],
    defaultNS: 'common',
    backend: {
      loadPath: (lngCode: string, nsName: string): string => {
        // Map namespaces to their respective modules
        const moduleMap: ModuleMap = {
          common: 'Core',
          core: 'Core',
          employees: 'EmployeeManagement',
          projects: 'ProjectManagement',
          project: 'ProjectManagement',
          equipment: 'EquipmentManagement',
          rentals: 'RentalManagement',
          timesheet: 'TimesheetManagement',
          payrolls: 'Payroll',
          mobile: 'MobileBridge',
          analytics: 'Analytics',
          booking: 'Core',
          customer: 'CustomerManagement'
        };
        
        const module = moduleMap[nsName] || 'Core';
        return `/locales/${module}/${lngCode}/${nsName}.json`;
      }
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie']
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;



