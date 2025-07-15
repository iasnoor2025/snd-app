import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonEn from '../lang/en/common.json';
import customerEn from '../lang/en/customer.json';
import employeeEn from '../lang/en/employee.json';
import leaveEn from '../lang/en/leave.json';
import payrollEn from '../lang/en/payroll.json';
import projectEn from '../lang/en/project.json';
import rentalEn from '../lang/en/rental.json';
import timesheetEn from '../lang/en/timesheet.json';

import commonAr from '../lang/ar/common.json';
import customerAr from '../lang/ar/customer.json';
import employeeAr from '../lang/ar/employee.json';
import leaveAr from '../lang/ar/leave.json';
import payrollAr from '../lang/ar/payroll.json';
import projectAr from '../lang/ar/project.json';
import rentalAr from '../lang/ar/rental.json';
import timesheetAr from '../lang/ar/timesheet.json';

const resources = {
    en: {
        common: commonEn,
        timesheet: timesheetEn,
        customer: customerEn,
        employee: employeeEn,
        project: projectEn,
        rental: rentalEn,
        payroll: payrollEn,
        leave: leaveEn,
    },
    ar: {
        common: commonAr,
        timesheet: timesheetAr,
        customer: customerAr,
        employee: employeeAr,
        project: projectAr,
        rental: rentalAr,
        payroll: payrollAr,
        leave: leaveAr,
    },
};

i18n
    // Load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
    // Learn more: https://github.com/i18next/i18next-http-backend
    // Want to add a language detector? -> https://github.com/i18next/i18next-browser-languageDetector
    // .use(Backend)
    // Detect user language
    // Learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // Initialize i18next
    // For all options read: https://www.i18next.com/overview/configuration-options
    .init({
        resources,
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',

        // Default namespace
        defaultNS: 'common',

        // Namespace separator
        nsSeparator: ':',

        // Key separator
        keySeparator: '.',

        interpolation: {
            escapeValue: false, // Not needed for react as it escapes by default
        },

        // Language detection options
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },

        // React specific options
        react: {
            useSuspense: false,
        },
    });

export default i18n;
