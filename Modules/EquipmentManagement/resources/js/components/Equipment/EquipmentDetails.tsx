import { formatDateTime } from '@/Core/utils/dateFormatter';
import { FC } from 'react';

interface Props {
    equipment: {
        id: number;
        name: string;
        description: string;
        category: string;
        daily_rate: number;
        weekly_rate: number;
        monthly_rate: number;
        status: 'available' | 'rented' | 'maintenance' | 'retired';
        serial_number: string;
        purchase_date: string;
        last_maintenance_date: string;
        notes: string;
        created_at: string;
        updated_at: string;
    };
    onEdit?: () => void;
}

export const EquipmentDetails: FC<Props> = ({ equipment, onEdit }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="flex items-center justify-between px-4 py-5 sm:px-6">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Equipment Details</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Equipment #{equipment.id}</p>
                </div>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Edit Equipment
                    </button>
                )}
            </div>
            <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{equipment.name}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{equipment.category}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{equipment.serial_number}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    equipment.status === 'available'
                                        ? 'bg-green-100 text-green-800'
                                        : equipment.status === 'rented'
                                          ? 'bg-blue-100 text-blue-800'
                                          : equipment.status === 'maintenance'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
                            </span>
                        </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Rental Rates</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-gray-500">Daily</p>
                                    <p className="font-medium">{formatCurrency(equipment.daily_rate)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Weekly</p>
                                    <p className="font-medium">{formatCurrency(equipment.weekly_rate)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Monthly</p>
                                    <p className="font-medium">{formatCurrency(equipment.monthly_rate)}</p>
                                </div>
                            </div>
                        </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formatDateTime(equipment.purchase_date)}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Last Maintenance</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formatDateTime(equipment.last_maintenance_date)}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{equipment.description}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{equipment.notes || 'No notes provided'}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formatDateTime(equipment.updated_at)}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};
