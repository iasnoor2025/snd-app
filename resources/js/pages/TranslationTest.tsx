import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';

export default function TranslationTest() {
    const { t, i18n } = useTranslation('common');

    return (
        <>
            <Head title="Translation Test" />
            <div className="min-h-screen bg-gray-100 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Translation Test</h1>
                    
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Testing Common Translations</h2>
                        
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
                        
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold mb-2">i18n Debug Info</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div><strong>Current Language:</strong> {i18n.language}</div>
                                <div><strong>Loaded Namespaces:</strong> {i18n.options.ns?.join(', ')}</div>
                                <div><strong>Backend URL Pattern:</strong> /locales/Core/en/common.json</div>
                                <div><strong>Is Initialized:</strong> {i18n.isInitialized ? 'Yes' : 'No'}</div>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <button 
                                onClick={() => window.location.reload()} 
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Reload Page
                            </button>
                            <a 
                                href="/locales/Core/en/common.json" 
                                target="_blank"
                                className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
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