import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelTranslationManager = () => {
    const [models, setModels] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [missingTranslations, setMissingTranslations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [modelsRes, languagesRes, statsRes] = await Promise.all([
                axios.get('/admin/localization/model-translations/models'),
                axios.get('/admin/localization/languages'),
                axios.get('/admin/localization/model-translations/statistics')
            ]);

            setModels(modelsRes.data.data || []);
            setLanguages(languagesRes.data.data || []);
            setStatistics(statsRes.data.data || {});
        } catch (error) {
            console.error('Failed to load initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMissingTranslations = async () => {
        if (!selectedModel || !selectedLanguage) return;

        setLoading(true);
        try {
            const response = await axios.get('/admin/localization/model-translations/missing', {
                params: {
                    model: selectedModel,
                    language: selectedLanguage
                }
            });
            setMissingTranslations(response.data.data || []);
        } catch (error) {
            console.error('Failed to load missing translations:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyTranslations = async (fromLang, toLang, overwrite = false) => {
        if (!selectedModel) return;

        setLoading(true);
        try {
            const response = await axios.post('/admin/localization/model-translations/copy', {
                model: selectedModel,
                from_language: fromLang,
                to_language: toLang,
                overwrite
            });

            alert(response.data.message);
            loadInitialData(); // Refresh statistics
        } catch (error) {
            console.error('Failed to copy translations:', error);
            alert('Failed to copy translations');
        } finally {
            setLoading(false);
        }
    };

    const exportTranslations = async (model, language = null) => {
        try {
            const response = await axios.get('/admin/localization/model-translations/export', {
                params: {
                    model,
                    language
                }
            });

            const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
                type: 'application/json'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${model}_translations_${language || 'all'}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export translations:', error);
            alert('Failed to export translations');
        }
    };

    const cleanupTranslations = async () => {
        if (!confirm('Are you sure you want to cleanup empty translations?')) return;

        setLoading(true);
        try {
            const response = await axios.post('/admin/localization/model-translations/cleanup');
            alert(response.data.message);
            loadInitialData(); // Refresh statistics
        } catch (error) {
            console.error('Failed to cleanup translations:', error);
            alert('Failed to cleanup translations');
        } finally {
            setLoading(false);
        }
    };

    const getCompletionColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Translation Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(statistics).map(([modelName, stats]) => (
                        <div key={modelName} className="border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{modelName}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Total Records: {stats.total_records}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                                Translatable Fields: {stats.translatable_fields?.join(', ')}
                            </p>
                            <div className="space-y-1">
                                {Object.entries(stats.languages || {}).map(([lang, langStats]) => (
                                    <div key={lang} className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{lang.toUpperCase()}</span>
                                        <span className={`text-sm font-medium ${getCompletionColor(langStats.percentage)}`}>
                                            {langStats.percentage}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMissingTranslations = () => (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Missing Translations</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Model
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">Select Model</option>
                            {models.map(model => (
                                <option key={model.name} value={model.name}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">Select Language</option>
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name} ({lang.code})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={loadMissingTranslations}
                    disabled={!selectedModel || !selectedLanguage || loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-4"
                >
                    {loading ? 'Loading...' : 'Find Missing Translations'}
                </button>

                {missingTranslations.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Model
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Attribute
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fallback Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {missingTranslations.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.model}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.attribute}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.fallback_value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {missingTranslations.length === 0 && selectedModel && selectedLanguage && (
                    <p className="text-green-600 font-medium">No missing translations found!</p>
                )}
            </div>
        </div>
    );

    const renderTools = () => (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Translation Tools</h3>

                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Copy Translations</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Copy translations from one language to another for the selected model.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">Select Model</option>
                                {models.map(model => (
                                    <option key={model.name} value={model.name}>
                                        {model.name}
                                    </option>
                                ))}
                            </select>

                            <select className="border border-gray-300 rounded-md px-3 py-2" id="fromLang">
                                <option value="">From Language</option>
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name} ({lang.code})
                                    </option>
                                ))}
                            </select>

                            <select className="border border-gray-300 rounded-md px-3 py-2" id="toLang">
                                <option value="">To Language</option>
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name} ({lang.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-3 flex space-x-2">
                            <button
                                onClick={() => {
                                    const fromLang = document.getElementById('fromLang').value;
                                    const toLang = document.getElementById('toLang').value;
                                    if (fromLang && toLang) copyTranslations(fromLang, toLang, false);
                                }}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                Copy (Skip Existing)
                            </button>

                            <button
                                onClick={() => {
                                    const fromLang = document.getElementById('fromLang').value;
                                    const toLang = document.getElementById('toLang').value;
                                    if (fromLang && toLang) copyTranslations(fromLang, toLang, true);
                                }}
                                disabled={loading}
                                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
                            >
                                Copy (Overwrite)
                            </button>
                        </div>
                    </div>

                    <div className="border-b pb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Export Translations</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Export model translations to JSON format.
                        </p>
                        <div className="flex space-x-2">
                            {models.map(model => (
                                <button
                                    key={model.name}
                                    onClick={() => exportTranslations(model.name)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                    Export {model.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Cleanup</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Remove empty translations from all models.
                        </p>
                        <button
                            onClick={cleanupTranslations}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Cleaning...' : 'Cleanup Empty Translations'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading && Object.keys(statistics).length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Model Translation Manager</h1>
                <p className="mt-2 text-gray-600">
                    Manage translations for model attributes using Spatie Translatable
                </p>
            </div>

            <div className="mb-6">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('missing')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'missing'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Missing Translations
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'tools'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Tools
                    </button>
                </nav>
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'missing' && renderMissingTranslations()}
            {activeTab === 'tools' && renderTools()}
        </div>
    );
};

export default ModelTranslationManager;
