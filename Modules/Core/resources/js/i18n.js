import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Map namespaces to their respective modules
const moduleMap = {
  common: 'Core',
  core: 'Core',
  employees: 'EmployeeManagement',
  employee: 'EmployeeManagement',
  projects: 'ProjectManagement',
  project: 'ProjectManagement',
  equipment: 'EquipmentManagement',
  rentals: 'RentalManagement',
  rental: 'RentalManagement',
  timesheet: 'TimesheetManagement',
  timesheets: 'TimesheetManagement',
  payrolls: 'Payroll',
  payroll: 'Payroll',
  mobile: 'MobileBridge',
  analytics: 'Analytics',
  booking: 'Core',
  customer: 'CustomerManagement',
  customers: 'CustomerManagement',
  leave: 'LeaveManagement',
  leaves: 'LeaveManagement',
  navigation: 'Core',
  fields: 'Core',
  actions: 'Core',
  status: 'Core',
  messages: 'Core',
  modules: 'Core',
  search: 'Core',
  employeemanagement: 'Core'
};

const i18nInstance = i18n.createInstance();

i18nInstance
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    debug: true, // Enable debug temporarily
    ns: Object.keys(moduleMap),
    defaultNS: 'common',
    returnObjects: true,
    backend: {
      loadPath: (lngs, namespaces) => {
        const module = moduleMap[namespaces[0]] || namespaces[0];
        // Check if the namespace is a sub-namespace of common
        if ([
          'navigation',
          'fields',
          'actions',
          'status',
          'messages',
          'modules',
          'search',
          'employeemanagement'
        ].includes(namespaces[0])) {
          return `/locales/Core/${lngs[0]}/common.json`;
        }
        return `/locales/${module}/${lngs[0]}/${namespaces[0]}.json`;
      },
      addPath: (lngs, namespace) => {
        const module = moduleMap[namespace] || namespace;
        return `/locales/${module}/${lngs[0]}/${namespace}.missing.json`;
      }
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie']
    },
    interpolation: {
      escapeValue: false
    },
    keySeparator: '.',
    nsSeparator: ':',
    pluralSeparator: '_',
    contextSeparator: '_'
  });

export default i18nInstance;
