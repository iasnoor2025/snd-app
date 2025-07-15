import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

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
    employeemanagement: 'Core',
    validation: 'Core',
    users: 'Core',
    roles: 'Core',
    permissions: 'Core',
    profile: 'Core',
    settings: 'Core',
    dashboard: 'Core',
    notifications: 'Core',
    reports: 'Core',
    audit: 'AuditCompliance',
    api: 'API',
};

// Get stored language preference or default to English
const getStoredLanguage = () => {
    const storedLang = localStorage.getItem('i18nextLng') || sessionStorage.getItem('i18nextLng');
    return storedLang || 'en';
};

// Store language preference
const storeLanguage = (lang) => {
    localStorage.setItem('i18nextLng', lang);
    sessionStorage.setItem('i18nextLng', lang);
    document.cookie = `i18next=${lang}; path=/; max-age=${365 * 24 * 60 * 60}`;
};

const i18nInstance = i18n.createInstance();

i18nInstance
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'ar', 'hi', 'bn', 'ur'],
        lng: getStoredLanguage(), // Set initial language from stored preference
        debug: false, // Disable debug in production
        ns: Object.keys(moduleMap),
        defaultNS: 'common',
        returnObjects: true,
        backend: {
            loadPath: (lngs, namespaces) => {
                const module = moduleMap[namespaces[0]] || namespaces[0];
                // Check if the namespace is a sub-namespace of common
                if (
                    [
                        'navigation',
                        'fields',
                        'actions',
                        'status',
                        'messages',
                        'modules',
                        'search',
                        'employeemanagement',
                        'validation',
                        'users',
                        'roles',
                        'permissions',
                        'profile',
                        'settings',
                        'dashboard',
                        'notifications',
                        'reports',
                    ].includes(namespaces[0])
                ) {
                    return `/locales/Core/${lngs[0]}/${namespaces[0]}.json`;
                }
                return `/locales/${module}/${lngs[0]}/${namespaces[0]}.json`;
            },
            addPath: (lngs, namespace) => {
                const module = moduleMap[namespace] || namespace;
                return `/locales/${module}/${lngs[0]}/${namespace}.missing.json`;
            },
        },
        detection: {
            order: ['localStorage', 'cookie', 'sessionStorage', 'querystring', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie', 'sessionStorage'],
            lookupCookie: 'i18next',
            lookupLocalStorage: 'i18nextLng',
            lookupSessionStorage: 'i18nextLng',
            lookupQuerystring: 'lang',
            cookieExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            cookieDomain: window.location.hostname,
            cookiePath: '/',
        },
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
        keySeparator: '.',
        nsSeparator: ':',
        pluralSeparator: '_',
        contextSeparator: '_',
    });

// Set document direction based on language and store language preference
i18nInstance.on('languageChanged', (lng) => {
    const dir = lng === 'ar' || lng === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;

    // Add RTL class for RTL languages
    if (dir === 'rtl') {
        document.documentElement.classList.add('rtl');
    } else {
        document.documentElement.classList.remove('rtl');
    }

    // Store language preference
    storeLanguage(lng);
});

// Initialize with stored language
const storedLang = getStoredLanguage();
if (storedLang) {
    i18nInstance.changeLanguage(storedLang);
}

export default i18nInstance;
