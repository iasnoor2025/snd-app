import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

export default function Appearance() {
    const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('system');

    const tabs = [
        { value: 'light' as const, icon: Sun, label: 'Light' },
        { value: 'dark' as const, icon: Moon, label: 'Dark' },
        { value: 'system' as const, icon: Monitor, label: 'System' },
    ];

    const handleAppearanceChange = (value: 'light' | 'dark' | 'system') => {
        setAppearance(value);
        // In a real implementation, this would update the theme
        if (value === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (value === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // System preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Appearance Settings" />
            
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="space-y-6">
                    <header>
                        <h1 className="text-2xl font-bold text-gray-900">Appearance Settings</h1>
                        <p className="text-gray-600 mt-1">Customize how the interface looks and feels.</p>
                    </header>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Theme Preference</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Choose how the interface should appear to you.
                        </p>

                        <div className="inline-flex gap-1 rounded-lg bg-gray-100 p-1">
                            {tabs.map(({ value, icon: Icon, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleAppearanceChange(value)}
                                    className={`flex items-center rounded-md px-4 py-2 transition-colors ${
                                        appearance === value
                                            ? 'bg-white shadow-sm text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-200/60 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-medium text-blue-900 mb-2">
                                Current Selection: {appearance.charAt(0).toUpperCase() + appearance.slice(1)}
                            </h3>
                            <p className="text-sm text-blue-800">
                                {appearance === 'system' && 'Automatically matches your device\'s theme preference.'}
                                {appearance === 'light' && 'Uses light theme with bright backgrounds.'}
                                {appearance === 'dark' && 'Uses dark theme with darker backgrounds.'}
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-md font-medium text-gray-900 mb-3">Preview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {tabs.map(({ value, label }) => (
                                    <div
                                        key={value}
                                        className={`p-4 rounded-lg border-2 transition-colors ${
                                            appearance === value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-gray-50'
                                        } ${
                                            value === 'dark' ? 'bg-gray-900 text-white' : ''
                                        }`}
                                    >
                                        <div className="text-sm font-medium mb-2">{label} Theme</div>
                                        <div className="text-xs opacity-75">
                                            This is how the {label.toLowerCase()} theme looks.
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
