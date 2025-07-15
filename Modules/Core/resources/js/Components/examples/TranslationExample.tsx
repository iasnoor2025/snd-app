import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Example component demonstrating how to use react-i18next
 * This replaces the previous getTranslation utility
 */
const TranslationExample: React.FC = () => {
    // Use the useTranslation hook to access translation functions
    const { t } = useTranslation(['common', 'employees']);

    // Example of language direction detection
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    return (
        <div className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className="mb-4 text-2xl font-bold">{t('common:dashboard')}</h1>

            <div className="space-y-4">
                <section className="rounded-md border p-4">
                    <h2 className="mb-2 text-xl font-semibold">{t('employees:employee_details')}</h2>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="font-medium">{t('employees:first_name')}:</span>
                            <span className="ml-2">John</span>
                        </div>
                        <div>
                            <span className="font-medium">{t('employees:last_name')}:</span>
                            <span className="ml-2">Doe</span>
                        </div>
                        <div>
                            <span className="font-medium">{t('employees:position')}:</span>
                            <span className="ml-2">Developer</span>
                        </div>
                        <div>
                            <span className="font-medium">{t('employees:department')}:</span>
                            <span className="ml-2">IT</span>
                        </div>
                    </div>
                </section>

                <section className="rounded-md border p-4">
                    <h2 className="mb-2 text-xl font-semibold">{t('common:actions')}</h2>

                    <div className="flex gap-2">
                        <button className="rounded bg-blue-500 px-4 py-2 text-white">{t('common:edit')}</button>
                        <button className="rounded bg-red-500 px-4 py-2 text-white">{t('common:delete')}</button>
                        <button className="rounded bg-green-500 px-4 py-2 text-white">{t('common:save')}</button>
                    </div>
                </section>

                <section className="rounded-md border p-4">
                    <h2 className="mb-2 text-xl font-semibold">{t('common:settings')}</h2>

                    <div className="flex items-center gap-2">
                        <button className="rounded bg-gray-200 px-4 py-2" onClick={() => i18n.changeLanguage('en')}>
                            English
                        </button>
                        <button className="rounded bg-gray-200 px-4 py-2" onClick={() => i18n.changeLanguage('ar')}>
                            العربية
                        </button>
                    </div>

                    <p className="mt-2">
                        {t('common:current_language')}: {i18n.language}
                    </p>
                    <p>
                        {t('common:text_direction')}: {isRTL ? 'RTL' : 'LTR'}
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TranslationExample;
