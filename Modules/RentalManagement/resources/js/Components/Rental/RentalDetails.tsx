import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { RentalStatusBadge } from '../RentalStatusBadge';
import { DocumentManager } from '../DocumentManager';
import { dateTimeDisplay } from '../date-time-display';

interface Props {
    rental: {
        id: number;
        customer: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
        equipment: {
            id: number;
            name: string;
            description: string;
        };
        start_date: string;
        end_date: string;
        status: string;
        notes: string;
        documents: any[];
        created_at: string;
        updated_at: string;
    };
    onEdit?: () => void;
}

export const RentalDetails: FC<Props> = ({ rental, onEdit }) => {
    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{t('rental_details')}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Rental #{rental.id}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <RentalStatusBadge status={rental.status} />
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            Edit Rental
                        </button>
                    )}
                </div>
            </div>
            <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Customer</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div>
                                <p className="font-medium">{rental.customer.name}</p>
                                <p className="text-gray-500">{rental.customer.email}</p>
                                <p className="text-gray-500">{rental.customer.phone}</p>
                            </div>
                        </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Equipment</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div>
                                <p className="font-medium">{rental.equipment.name}</p>
                                <p className="text-gray-500">{rental.equipment.description}</p>
                            </div>
                        </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">{t('rental_period')}</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div className="flex space-x-4">
                                <div>
                                    <p className="text-gray-500">{t('lbl_start_date')}</p>
                                    <p className="font-medium">{dateTimeDisplay(rental.start_date)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">{t('end_date')}</p>
                                    <p className="font-medium">{dateTimeDisplay(rental.end_date)}</p>
                                </div>
                            </div>
                        </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {rental.notes || 'No notes provided'}
                        </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Documents</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <DocumentManager
                                rentalId={rental.id}
                                documents={rental.documents}
                            />
                        </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">{t('last_updated')}</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {dateTimeDisplay(rental.updated_at)}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};
