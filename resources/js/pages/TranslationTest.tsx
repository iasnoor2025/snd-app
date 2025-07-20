import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function TranslationTest() {
    const { t, i18n } = useTranslation(['common', 'fields', 'actions', 'messages', 'status']);

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
                                <strong>Key:</strong> common:navigation.dashboard
                            </div>
                            <div>
                                <strong>Value:</strong> {t('common:navigation.dashboard')}
                            </div>

                            <div>
                                <strong>Key:</strong> common:navigation.users
                            </div>
                            <div>
                                <strong>Value:</strong> {t('common:navigation.users')}
                            </div>

                            <div>
                                <strong>Key:</strong> actions:create
                            </div>
                            <div>
                                <strong>Value:</strong> {t('actions:create')}
                            </div>

                            <div>
                                <strong>Key:</strong> fields:name
                            </div>
                            <div>
                                <strong>Value:</strong> {t('fields:name')}
                            </div>

                            <div>
                                <strong>Key:</strong> messages:loading
                            </div>
                            <div>
                                <strong>Value:</strong> {t('messages:loading')}
                            </div>

                            <div>
                                <strong>Key:</strong> status:active
                            </div>
                            <div>
                                <strong>Value:</strong> {t('status:active')}
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <h3 className="mb-4 text-lg font-semibold">Language Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <strong>Current Language:</strong> {i18n.language}
                                </div>
                                <div>
                                    <strong>Text Direction:</strong> {i18n.dir()}
                                </div>
                                <div>
                                    <strong>Available Languages:</strong> {i18n.languages.join(', ')}
                                </div>
                                <div>
                                    <strong>Loaded Namespaces:</strong> {i18n.options.ns?.join(', ')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <h3 className="mb-4 text-lg font-semibold">Fallback Test</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <strong>Non-existent Key:</strong> common:non_existent_key
                                </div>
                                <div>
                                    <strong>Value:</strong> {t('common:non_existent_key', 'Default Fallback')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <h3 className="mb-4 text-lg font-semibold">Interpolation Test</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <strong>Key with Variables:</strong> common:welcome_user
                                </div>
                                <div>
                                    <strong>Value:</strong> {t('common:welcome_user', { username: 'John Doe' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
