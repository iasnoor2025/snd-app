import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const { data, setData, errors, put, reset, processing } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        // Simulate form submission
        setTimeout(() => {
            setRecentlySuccessful(true);
            reset();
            setTimeout(() => setRecentlySuccessful(false), 3000);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Password Settings" />
            
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="space-y-6">
                    <header>
                        <h1 className="text-2xl font-bold text-gray-900">Update Password</h1>
                        <p className="text-gray-600 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                    </header>

                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={updatePassword} className="space-y-6">
                            <div className="grid gap-2">
                                <label htmlFor="current_password" className="text-sm font-medium text-gray-700">
                                    Current password
                                </label>
                                <input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    type="password"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                />
                                {errors.current_password && (
                                    <p className="text-sm text-red-600">{errors.current_password}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    New password
                                </label>
                                <input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type="password"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    autoComplete="new-password"
                                    placeholder="New password"
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                    Confirm password
                                </label>
                                <input
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type="password"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Password'}
                                </button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-green-600">Password updated successfully!</p>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">Password Requirements</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• At least 8 characters long</li>
                            <li>• Include uppercase and lowercase letters</li>
                            <li>• Include at least one number</li>
                            <li>• Include at least one special character</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 