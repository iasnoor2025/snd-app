import { PageProps } from '@/Core/types';
import { Equipment, Rental, RentalItem } from '@/Core/types/models';
import { Head, usePage } from '@inertiajs/react';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface Props extends PageProps {
    rental: Rental & {
        customer: {
            id: number;
            company_name: string;
            contact_name: string;
            email: string;
            phone: string;
            address?: string;
        };
        rental_items: (RentalItem & {
            equipment: Equipment;
        })[];
    };
}

export default function Print({ rental }: Props) {
    const { t } = useTranslation('rental');

    const { props } = usePage();
    const locale = props.locale || 'en';

    useEffect(() => {
        // Auto print when component mounts
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return dayjs(dateString).format('YYYY-MM-DD');
    };

    const getStatusText = (status: string) => {
        return status.toUpperCase();
    };

    const rentalItemColumns = [
        {
            title: 'Equipment',
            dataIndex: ['equipment', 'name'],
            key: 'equipment',
            render: (_: string, record: RentalItem & { equipment: Equipment }) => `${record.equipment.name} (${record.equipment.model})`,
        },
        {
            title: 'Serial Number',
            dataIndex: ['equipment', 'serial_number'],
            key: 'serial_number',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Rate Type',
            dataIndex: 'rate_type',
            key: 'rate_type',
            render: (rate_type: string) => (rate_type ? rate_type.charAt(0).toUpperCase() + rate_type.slice(1) : '-'),
        },
        {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            render: (rate: number) => formatCurrency(rate),
        },
        {
            title: 'Total',
            key: 'total',
            render: (record: RentalItem) => formatCurrency(record.rate * record.quantity),
        },
    ];

    return (
        <div className="print-container">
            <Head title={`Print Rental: ${rental.rental_number}`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('rental_agreement')}</h1>
                        <p className="text-gray-600">Rental Number: {rental.rental_number}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">{rental.customer?.name}</p>
                        <p>{rental.customer?.address}</p>
                        <p>
                            {rental.customer?.city}, {rental.customer?.country}
                        </p>
                    </div>
                </div>

                {/* Rental Details */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold">{t('rental_details')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p>
                                <span className="font-semibold">Start Date:</span> {formatDate(rental.start_date)}
                            </p>
                            <p>
                                <span className="font-semibold">Expected End Date:</span> {formatDate(rental.expected_end_date)}
                            </p>
                            {rental.actual_end_date && (
                                <p>
                                    <span className="font-semibold">Actual End Date:</span> {formatDate(rental.actual_end_date)}
                                </p>
                            )}
                        </div>
                        <div>
                            <p>
                                <span className="font-semibold">Status:</span> {getStatusText(rental.status)}
                            </p>
                            <p>
                                <span className="font-semibold">Total Amount:</span> {formatCurrency(rental.total_amount)}
                            </p>
                            {rental.deposit_amount && (
                                <p>
                                    <span className="font-semibold">Deposit Amount:</span> {formatCurrency(rental.deposit_amount)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rental Items */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold">{t('rental_items')}</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Equipment</th>
                                <th className="border p-2 text-left">{t('lbl_serial_number')}</th>
                                <th className="border p-2 text-right">Quantity</th>
                                <th className="border p-2 text-right">{t('lbl_rate_type')}</th>
                                <th className="border p-2 text-right">Rate</th>
                                <th className="border p-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rental.rental_items?.map((item) => (
                                <tr key={item.id}>
                                    <td className="border p-2">
                                        {item.equipment?.name} ({item.equipment?.model})
                                    </td>
                                    <td className="border p-2">{item.equipment?.serial_number}</td>
                                    <td className="border p-2 text-right">{item.quantity}</td>
                                    <td className="border p-2 text-right">{item.rate_type}</td>
                                    <td className="border p-2 text-right">{formatCurrency(item.rate)}</td>
                                    <td className="border p-2 text-right">{formatCurrency(item.rate * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Notes */}
                {rental.notes && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">Notes</h2>
                        <p className="whitespace-pre-line">{rental.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 border-t pt-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="mb-2 font-semibold">customer Signature</h3>
                            <div className="h-20 border-b border-gray-400"></div>
                            <p className="mt-2 text-sm text-gray-600">Date: _________________</p>
                        </div>
                        <div>
                            <h3 className="mb-2 font-semibold">{t('company_representative')}</h3>
                            <div className="h-20 border-b border-gray-400"></div>
                            <p className="mt-2 text-sm text-gray-600">Date: _________________</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          body {
            font-size: 12pt;
            color: #000;
          }

          .ant-typography {
            color: #000 !important;
          }

          .ant-table-thead > tr > th {
            background-color: #f0f0f0 !important;
            color: #000 !important;
          }

          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
        </div>
    );
}
