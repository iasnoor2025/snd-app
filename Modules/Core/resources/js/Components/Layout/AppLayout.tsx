import React from 'react';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface AppLayoutProps extends PropsWithChildren {
    title?: string;
    header?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    title = 'Core Module',
    header
}) => {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Logo */}
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <img
                                        src="/logo.svg"
                                        alt="Logo"
                                        className="h-9 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href="/"
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                                >
                                    Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Heading */}
            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Page Content */}
            <main>
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {children}
                    </div>
                </div>
            </main>

            {/* Flash Messages */}
            <div id="flash-messages" />
        </div>
    );
};

</div>

