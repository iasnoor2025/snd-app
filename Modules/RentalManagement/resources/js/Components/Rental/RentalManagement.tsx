import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { RentalStatus } from '../RentalStatus';
import { RentalWorkflowActions } from './RentalWorkflowActions';
import { CustomerFilters } from '../CustomerFilters';
import { CustomersDataTable } from '../CustomersDataTable';
import { EquipmentDataTable } from '../EquipmentDataTable'; 
import { DocumentManager } from '../DocumentManager';

interface Props {
    initialRentals?: any[];
    customers?: any[];
    equipment?: any[];
}

export const RentalManagement: FC<Props> = ({ initialRentals = [], customers = [], equipment = [] }) => {
    const { t } = useTranslation();
    const [selectedRental, setSelectedRental] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'rentals' | 'customers' | 'equipment'>('rentals');

    return (
        <>
            <Head title={t('rental_management')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900">{t('rental_management')}</h2>
                                <RentalWorkflowActions
                                    selectedRental={selectedRental}
                                    onRentalSelect={setSelectedRental}
                                />
                            </div>

                            <div className="mb-6">
                                <nav className="flex space-x-4">
                                    <button
                                        onClick={() => setActiveTab('rentals')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            activeTab === 'rentals'
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                        Rentals
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('customers')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            activeTab === 'customers'
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                        Customers
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('equipment')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            activeTab === 'equipment'
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                        Equipment
                                    </button>
                                </nav>
                            </div>

                            {activeTab === 'rentals' && (
                                <div className="space-y-6">
                                    <RentalStatus rentals={initialRentals} />
                                    {selectedRental && (
                                        <DocumentManager
                                            rentalId={selectedRental.id}
                                            documents={selectedRental.documents || []}
                                        />
                                    )}
                                </div>
                            )}

                            {activeTab === 'customers' && (
                                <div className="space-y-6">
                                    <CustomerFilters />
                                    <CustomersDataTable customers={customers} />
                                </div>
                            )}

                            {activeTab === 'equipment' && (
                                <div className="space-y-6">
                                    <EquipmentDataTable equipment={equipment} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};














