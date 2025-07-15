import { Link } from '@inertiajs/react';
import React from 'react';
import { route } from '../../routes';

interface ModuleCardProps {
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'pending';
    config?: Record<string, any>;
    onInitialize?: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ name, description, status, config, onInitialize }) => {
    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                    <span className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${statusColors[status]}`}>{status}</span>
                </div>

                <p className="mt-2 text-sm text-gray-600">{description}</p>

                {config && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">Configuration</h4>
                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            {Object.entries(config).map(([key, value]) => (
                                <div key={key} className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">{key}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    {onInitialize && (
                        <button
                            onClick={onInitialize}
                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                        >
                            Initialize
                        </button>
                    )}
                    <Link
                        href={route('core.modules.show', { name })}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};
