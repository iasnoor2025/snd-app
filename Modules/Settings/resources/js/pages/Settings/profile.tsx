import { Head, useForm } from '@inertiajs/react';
import { Mail, Shield, Trash2, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Profile() {
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data, setData, errors, processing } = useForm({
        name: 'John Doe',
        email: 'john.doe@example.com',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Simulate form submission
        setTimeout(() => {
            setRecentlySuccessful(true);
            setTimeout(() => setRecentlySuccessful(false), 3000);
        }, 1000);
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion would be processed here.');
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Profile Settings" />

            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="space-y-6">
                    <header>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="mt-1 text-gray-600">Update your account information and preferences.</p>
                    </header>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <User className="h-5 w-5" />
                            Profile Information
                        </h2>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter your full name"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter your email address"
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Roles</label>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                        <Shield className="mr-1 h-3 w-3" />
                                        Admin
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                        <User className="mr-1 h-3 w-3" />
                                        Employee
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Language Preference</label>
                                <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none">
                                    <option value="en">English</option>
                                    <option value="ar">العربية</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>

                                {recentlySuccessful && <p className="text-sm text-green-600">Profile updated successfully!</p>}
                            </div>
                        </form>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <Mail className="h-5 w-5" />
                            Email Verification
                        </h2>

                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">Your email address is verified.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-red-200 bg-white p-6 shadow">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Danger Zone
                        </h2>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                            </p>

                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex justify-center rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Delete Account
                            </button>

                            {showDeleteConfirm && (
                                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                                    <p className="mb-3 text-sm text-red-800">Are you absolutely sure? This action cannot be undone.</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                                        >
                                            Yes, Delete My Account
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
