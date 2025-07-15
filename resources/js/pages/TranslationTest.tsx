import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function TranslationTest() {
    const { t, i18n } = useTranslation('common');

    return (
        <>
            <Head title="Translation Test" />
            <div className="min-h-screen bg-gray-100 py-12">
                <div className="mx-auto max-w-4xl px-4">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900">Translation Test</h1>

                    <div className="space-y-4 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Testing Common Translations</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong>Key:</strong> navigation.dashboard
                            </div>
                            <div>
                                <strong>Value:</strong> {t('navigation.dashboard')}
                            </div>

                            <div>
                                <strong>Key:</strong> navigation.users
                            </div>
                            <div>
                                <strong>Value:</strong> {t('navigation.users')}
                            </div>

                            <div>
                                <strong>Key:</strong> actions.create
                            </div>
                            <div>
                                <strong>Value:</strong> {t('actions.create')}
                            </div>

                            <div>
                                <strong>Key:</strong> fields.name
                            </div>
                            <div>
                                <strong>Value:</strong> {t('fields.name')}
                            </div>

                            <div>
                                <strong>Key:</strong> messages.loading
                            </div>
                            <div>
                                <strong>Value:</strong> {t('messages.loading')}
                            </div>

                            <div>
                                <strong>Key:</strong> status.active
                            </div>
                            <div>
                                <strong>Value:</strong> {t('status.active')}
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-6">
                            <h3 className="mb-2 text-lg font-semibold">i18n Debug Info</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div>
                                    <strong>Current Language:</strong> {i18n.language}
                                </div>
                                <div>
                                    <strong>Loaded Namespaces:</strong> {i18n.options.ns?.join(', ')}
                                </div>
                                <div>
                                    <strong>Backend URL Pattern:</strong> /locales/Core/en/common.json
                                </div>
                                <div>
                                    <strong>Is Initialized:</strong> {i18n.isInitialized ? 'Yes' : 'No'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button onClick={() => window.location.reload()} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                                Reload Page
                            </button>
                            <a
                                href="/locales/Core/en/common.json"
                                target="_blank"
                                className="ml-4 inline-block rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                            >
                                View Translation File
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
