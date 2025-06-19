import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@inertiajs/react';
import { CustomerForm } from '../CustomerForm';
import { Modal } from '../Modal';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, defaultCustomerValues } from '@/schemas/customer.schema';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    rental?: any;
    customers: any[];
    equipment: any[];
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export const RentalForm: FC<Props> = ({ rental, customers, equipment, onSubmit, onCancel }) => {
    const { data, setData, post, put, processing, errors } = useForm({
        customer_id: rental?.customer_id || '',
        equipment_id: rental?.equipment_id || '',
        start_date: rental?.start_date || '',
        end_date: rental?.end_date || '',
        status: rental?.status || 'pending',
        notes: rental?.notes || '',
    })

    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [creatingCustomer, setCreatingCustomer] = useState(false);
    
    // Set up customer form using react-hook-form
    const customerForm = useHookForm({
        resolver: zodResolver(customerSchema),
        defaultValues: defaultCustomerValues,
        mode: 'onChange'
    })

    const handleSubmit = (e: React.FormEvent) => {
  const { t } = useTranslation('rental');

        e.preventDefault();
        if (rental) {
            put(route('rentals.update', rental.id), {
                onSuccess: () => onSubmit(data),
            })
        } else {
            post(route('rentals.store'), {
                onSuccess: () => onSubmit(data),
            })
        }
    };

    const handleCustomerSubmit = async (customerData) => {
        setCreatingCustomer(true);
        try {
            router.post(route('customers.store'), customerData, {
                onSuccess: (page) => {
                    setShowCustomerModal(false);
                    setCreatingCustomer(false);
                    toast.success('Customer created successfully');
                    // Update customer selection if needed
                    if (page.props.customer && page.props.customer.id) {
                        setData('customer_id', page.props.customer.id);
                    }
                },
                onError: (errors) => {
                    setCreatingCustomer(false);
                    toast.error('Failed to create customer');
                    console.error('Customer creation errors:', errors);
                }
            })
        } catch (error) {
            setCreatingCustomer(false);
            toast.error('Failed to create customer');
            console.error('Customer creation error:', error);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                            Customer
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <select
                                id="customer_id"
                                name="customer_id"
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                <option value="">{t('ph_select_a_customer')}</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowCustomerModal(true)}
                                className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                New Customer
                            </button>
                        </div>
                        {errors.customer_id && (
                            <p className="mt-2 text-sm text-red-600">{errors.customer_id}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="equipment_id" className="block text-sm font-medium text-gray-700">
                            Equipment
                        </label>
                        <select
                            id="equipment_id"
                            name="equipment_id"
                            value={data.equipment_id}
                            onChange={(e) => setData('equipment_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            <option value="">{t('ph_select_equipment')}</option>
                            {equipment.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        {errors.equipment_id && (
                            <p className="mt-2 text-sm text-red-600">{errors.equipment_id}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                            {t('lbl_start_date')}
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors.start_date && (
                            <p className="mt-2 text-sm text-red-600">{errors.start_date}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                            {t('end_date')}
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors.end_date && (
                            <p className="mt-2 text-sm text-red-600">{errors.end_date}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        {errors.status && (
                            <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors.notes && (
                            <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        {rental ? 'Update Rental' : 'Create Rental'}
                    </button>
                </div>
            </form>

            <Modal
                show={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                title={t('ttl_new_customer')}
                <CustomerForm
                    form={customerForm}
                    onSubmit={handleCustomerSubmit}
                    onCancel={() => setShowCustomerModal(false)}
                    isSubmitting={creatingCustomer}
                    submitText="Create Customer"
                />
            </Modal>
        </div>
    );
};














